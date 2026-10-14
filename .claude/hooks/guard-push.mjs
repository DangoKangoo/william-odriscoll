// PreToolUse (Bash|PowerShell): block pushes that skip the PR flow. Branch
// protection doesn't stop them because enforce_admins is off for main.
// - While on main, every push is blocked, unless the same command first moved
//   to another branch with `&&` (`git switch -c fix/x && git push -u origin fix/x`).
// - On other branches: force pushes, +refspecs, wildcard refspecs, --all,
//   --mirror and pushes to main are blocked.
// The deny rules in settings.json catch common spellings; this also handles
// quotes, line continuations, git's own options and full paths to git.
// It reads the command text, so it's a guard rail, not a security boundary.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
// Line continuations are a backslash in Bash and a backtick in PowerShell.
// Joining the other shell's character would merge two separate commands.
const continuation = input.tool_name === "PowerShell" ? /`\r?\n/g : /\\\r?\n/g;
const command = (input.tool_input?.command ?? "")
  .replace(continuation, " ")
  // `2>&1` and `&>` are redirections, not the `&` command separator.
  .replace(/\d*[<>]&(\d+|-)/g, " ")
  .replace(/&>>?/g, " >");
if (!/push/.test(command.replace(/["'`\\]/g, ""))) process.exit(0);

const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR;
function git(...args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

// origin/HEAD names the default branch; "main" if the remote never set it.
const defaultBranch =
  git("symbolic-ref", "--short", "refs/remotes/origin/HEAD").replace(
    /^origin\//,
    "",
  ) || "main";
// After a switch that may have failed, the branch can't be known.
const UNKNOWN = Symbol("unknown branch");

// Reads a word the way the shell would: quotes anywhere are dropped
// (ma"in" -> main), and grouping around it too ($(git -> git, main) -> main).
const unwrap = (word) =>
  word.replace(/["'`]/g, "").replace(/^[${(]+|[)};]+$/g, "");
const isGit = (word) => /(^|[\\/])git(\.exe)?$/i.test(word);
const isRedirect = (word) => /^\d*[<>]/.test(word);
// Options before the subcommand that take the next word as their value.
const GIT_OPTIONS_WITH_VALUE = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
  "--attr-source",
]);
// These point git at another repository, so a switch there doesn't move ours.
const OTHER_REPO_OPTIONS = ["-C", "--git-dir", "--work-tree"];
const PUSH_OPTIONS_WITH_VALUE = new Set([
  "-o",
  "--push-option",
  "--repo",
  "--receive-pack",
  "--exec",
]);

// Every git command among the words: one segment can hold several, as in
// `echo $(git rev-parse HEAD) $(git push --force)`.
function gitCommands(words) {
  const starts = words.flatMap((word, at) => (isGit(word) ? [at] : []));
  return starts.flatMap((start, n) => {
    const end = starts[n + 1] ?? words.length;
    let i = start + 1;
    let otherRepo = false;
    while (i < end && words[i].startsWith("-")) {
      const option = words[i].split("=")[0];
      if (OTHER_REPO_OPTIONS.includes(option)) otherRepo = true;
      i += GIT_OPTIONS_WITH_VALUE.has(words[i]) ? 2 : 1;
    }
    if (i >= end) return [];
    const subcommand = words[i].replace(/\\/g, "");
    return [{ subcommand, args: words.slice(i + 1, end), otherRepo }];
  });
}

// Where a switch or checkout leaves HEAD: a branch name, UNKNOWN, or
// undefined when it doesn't move branches.
function switchTarget({ subcommand, args, otherRepo }) {
  if (otherRepo || (subcommand !== "switch" && subcommand !== "checkout"))
    return undefined;
  if (args.includes("--")) return undefined; // `git checkout -- file`
  const createAt = args.findIndex((a) => ["-c", "-C", "-b", "-B"].includes(a));
  if (createAt !== -1) return args[createAt + 1] ?? UNKNOWN;
  const positional = args.find((a) => !a.startsWith("-"));
  if (!positional) return UNKNOWN;
  const tracked = args.includes("--track") || args.includes("-t");
  const name = tracked ? positional.replace(/^[^/]+\//, "") : positional;
  if (name === defaultBranch) return defaultBranch;
  // `git switch` only takes branches; `git checkout <x>` may restore a file.
  return subcommand === "switch" || tracked ? name : UNKNOWN;
}

function splitPushArgs(args) {
  const flags = [];
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    const word = args[i];
    if (isRedirect(word)) {
      if (/^\d*[<>]+$/.test(word)) i++; // `> file`: skip the file too
    } else if (!word.startsWith("-")) positionals.push(word);
    else if (PUSH_OPTIONS_WITH_VALUE.has(word)) i++;
    else flags.push(word);
  }
  // The first positional is the remote; the rest are refspecs.
  return { flags, refspecs: positionals.slice(1) };
}

const isForceFlag = (flag) =>
  flag === "--force" ||
  flag.startsWith("--force-with-lease") ||
  /^-[a-zA-Z]*f[a-zA-Z]*$/.test(flag);
const targetsDefault = (refspec) =>
  new RegExp(`^\\+?([^:]*:)?(refs/heads/)?${defaultBranch}$`).test(refspec);

function reasonToBlock(args, branch) {
  if (branch === UNKNOWN)
    return "a switch earlier in this command may have failed, so this could push from main. Run the switch and the push as separate commands";
  if (branch === defaultBranch)
    return `you're on ${defaultBranch}. Create a branch first`;
  const { flags, refspecs } = splitPushArgs(args);
  if (flags.some(isForceFlag) || refspecs.some((r) => r.startsWith("+")))
    return "force pushes are not allowed";
  if (flags.some((f) => f === "--all" || f === "--mirror"))
    return `--all and --mirror would push ${defaultBranch}`;
  if (refspecs.some((r) => r.includes("*")))
    return `wildcard refspecs can push ${defaultBranch}`;
  if (refspecs.some(targetsDefault))
    return `pushing to ${defaultBranch} is not allowed`;
  return null;
}

// Walk the command in order. `parts` alternates segment, separator, segment.
const parts = command.split(/(&&|\|\||[;|&\n])/);
let branch = git("branch", "--show-current");
for (let p = 0; p < parts.length; p += 2) {
  const words = parts[p].trim().split(/\s+/).map(unwrap).filter(Boolean);
  let switched;
  for (const gitCommand of gitCommands(words)) {
    if (gitCommand.subcommand === "push") {
      const reason = reasonToBlock(gitCommand.args, branch);
      if (reason) {
        console.error(
          `Blocked by .claude/hooks/guard-push.mjs: ${reason}. Push a feature branch and open a PR with /ship.`,
        );
        process.exit(2);
      }
    }
    switched = switchTarget(gitCommand) ?? switched;
  }
  // Only `&&` guarantees the switch succeeded before the next command runs.
  if (switched !== undefined) {
    const followedByAnd = parts[p + 1] === "&&";
    branch = followedByAnd || switched === defaultBranch ? switched : UNKNOWN;
  }
}
