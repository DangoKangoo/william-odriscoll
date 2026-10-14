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
// A switch whose target can't be read from the text (`git checkout x` may
// restore a file, `git switch -` goes back).
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

// A segment's words, read by the shell rules above, with the raw form kept.
function tokens(segment) {
  return segment
    .trim()
    .split(/\s+/)
    .map((raw) => ({ raw, word: unwrap(raw) }))
    .filter(({ word }) => word);
}

// Every git command in a segment. A git word starts one only in command
// position: the segment's first git word, or one opening a substitution or
// subshell, as in `echo $(git rev-parse HEAD) $(git push --force)`. So an
// argument like `feat/git` doesn't cut a push short.
function gitCommands(segmentTokens) {
  const words = segmentTokens.map(({ word }) => word);
  const opensCommand = (raw) => /^["']*[$`(]/.test(raw);
  const starts = [];
  segmentTokens.forEach(({ raw, word }, at) => {
    if (isGit(word) && (starts.length === 0 || opensCommand(raw)))
      starts.push(at);
  });
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

const PUSHES_EVERY_BRANCH = ["--all", "--branches", "--mirror"];

// `possible` is every branch the push might run on.
function reasonToBlock(args, possible) {
  if (
    possible.has(UNKNOWN) ||
    (possible.has(defaultBranch) && possible.size > 1)
  )
    return `a switch earlier in this command may have failed, so this could push from ${defaultBranch}. Run the switch and the push as separate commands`;
  if (possible.has(defaultBranch))
    return `you're on ${defaultBranch}. Create a branch first`;
  const { flags, refspecs } = splitPushArgs(args);
  if (flags.some(isForceFlag) || refspecs.some((r) => r.startsWith("+")))
    return "force pushes are not allowed";
  if (flags.some((f) => PUSHES_EVERY_BRANCH.includes(f)))
    return `--all, --branches and --mirror would push ${defaultBranch}`;
  if (refspecs.includes(":"))
    return `the matching refspec ":" can push ${defaultBranch}`;
  if (refspecs.some((r) => r.includes("*")))
    return `wildcard refspecs can push ${defaultBranch}`;
  if (refspecs.some(targetsDefault))
    return `pushing to ${defaultBranch} is not allowed`;
  return null;
}

// Walk the command in order. `parts` alternates segment, separator, segment.
// Inside an `&&` chain, a switch is known to have worked when the next
// command runs. Any other separator runs the next command either way, so
// after it the branch from before the chain and every switch in it are all
// possible.
const parts = command.split(/(&&|\|\||[;|&\n])/);
let beforeChain = new Set([git("branch", "--show-current")]);
let chainBranch;
let chainSwitches = [];
for (let p = 0; p < parts.length; p += 2) {
  for (const gitCommand of gitCommands(tokens(parts[p]))) {
    if (gitCommand.subcommand === "push") {
      const possible =
        chainBranch === undefined ? beforeChain : new Set([chainBranch]);
      const reason = reasonToBlock(gitCommand.args, possible);
      if (reason) {
        console.error(
          `Blocked by .claude/hooks/guard-push.mjs: ${reason}. Push a feature branch and open a PR with /ship.`,
        );
        process.exit(2);
      }
    }
    const target = switchTarget(gitCommand);
    if (target !== undefined) {
      chainBranch = target;
      chainSwitches.push(target);
    }
  }
  if (parts[p + 1] !== "&&") {
    beforeChain = new Set([...beforeChain, ...chainSwitches]);
    chainBranch = undefined;
    chainSwitches = [];
  }
}
