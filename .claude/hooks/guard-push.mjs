// PreToolUse (Bash|PowerShell): block pushes that skip the PR flow. Branch
// protection doesn't stop them because enforce_admins is off for main. The deny
// rules in settings.json catch common spellings; this also catches quoted
// words, line continuations, a bare `git push` while on main, force flags
// anywhere, +refspecs and wildcard refspecs.
// It reads the command text, so it's a guard rail, not a security boundary.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
// Join bash (\) and PowerShell (`) line continuations before splitting lines.
const command = (input.tool_input?.command ?? "").replace(/[\\`]\r?\n/g, " ");
if (!/\bpush\b/.test(command)) process.exit(0);

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
let currentBranch = git("branch", "--show-current");

// "main" -> main, (git -> git, $(git -> git.
const unwrap = (word) => word.replace(/^[$("'`]+|[)"'`]+$/g, "");
const isGit = (word) => /(^|[\\/])git(\.exe)?$/i.test(word);
const GIT_OPTIONS_WITH_VALUE = new Set(["-C", "-c"]);
const PUSH_OPTIONS_WITH_VALUE = new Set([
  "-o",
  "--push-option",
  "--repo",
  "--receive-pack",
  "--exec",
]);

// The subcommand and its arguments, skipping git's own options (`git -C x push`).
function parseGit(words) {
  const gitAt = words.findIndex(isGit);
  if (gitAt === -1) return null;
  let i = gitAt + 1;
  while (i < words.length && words[i].startsWith("-")) {
    i += GIT_OPTIONS_WITH_VALUE.has(words[i]) ? 2 : 1;
  }
  if (i >= words.length) return null;
  return { subcommand: words[i], args: words.slice(i + 1) };
}

// A branch switch earlier in the same command changes what a bare push sends.
function switchedTo({ subcommand, args }) {
  if (subcommand === "switch") return args.find((a) => !a.startsWith("-"));
  if (subcommand === "checkout") {
    const flagAt = args.findIndex((a) => a === "-b" || a === "-B");
    return flagAt === -1 ? undefined : args[flagAt + 1];
  }
  return undefined;
}

function splitPushArgs(args) {
  const flags = [];
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("-")) positionals.push(args[i]);
    else if (PUSH_OPTIONS_WITH_VALUE.has(args[i])) i++;
    else flags.push(args[i]);
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

function reasonToBlock(args) {
  const { flags, refspecs } = splitPushArgs(args);
  if (flags.some(isForceFlag) || refspecs.some((r) => r.startsWith("+")))
    return "force pushes are not allowed";
  if (flags.some((f) => f === "--all" || f === "--mirror"))
    return `--all and --mirror would push ${defaultBranch}`;
  if (refspecs.some((r) => r.includes("*")))
    return `wildcard refspecs can push ${defaultBranch}`;
  if (refspecs.some(targetsDefault))
    return `pushing to ${defaultBranch} is not allowed`;
  const pushesCurrent = refspecs.length === 0 || refspecs.includes("HEAD");
  if (pushesCurrent && currentBranch === defaultBranch)
    return `you're on ${defaultBranch}. Create a branch first`;
  return null;
}

// Check each git command in a compound command, in order.
for (const segment of command.split(/&&|\|\||[;|&\n]/)) {
  const parsed = parseGit(segment.trim().split(/\s+/).map(unwrap));
  if (!parsed) continue;
  currentBranch = switchedTo(parsed) ?? currentBranch;
  if (parsed.subcommand !== "push") continue;

  const reason = reasonToBlock(parsed.args);
  if (reason) {
    console.error(
      `Blocked by .claude/hooks/guard-push.mjs: ${reason}. Push a feature branch and open a PR with /ship.`,
    );
    process.exit(2);
  }
}
