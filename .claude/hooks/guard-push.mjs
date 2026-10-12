// PreToolUse (Bash|PowerShell): block pushes that skip the PR flow. Branch
// protection doesn't stop them because enforce_admins is off for main. The deny
// rules in settings.json catch common spellings; this also catches a bare
// `git push` while on main, force flags anywhere, and +refspecs.
// It reads the command text, so it's a guard rail, not a security boundary.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const command = input.tool_input?.command ?? "";
if (!/\bgit\b[^\n;&|]*\bpush\b/.test(command)) process.exit(0);

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
const currentBranch = git("branch", "--show-current");

const isForce = (word) =>
  word === "--force" ||
  word.startsWith("--force-with-lease") ||
  /^-[a-zA-Z]*f[a-zA-Z]*$/.test(word) ||
  /^\+/.test(word);
const targetsDefault = (word) =>
  !word.startsWith("-") &&
  new RegExp(`^\\+?([^:]*:)?(refs/heads/)?${defaultBranch}$`).test(word);
const pushesEverything = (word) => word === "--all" || word === "--mirror";

function reasonToBlock(words) {
  if (currentBranch === defaultBranch)
    return `you're on ${defaultBranch}. Create a branch first`;
  if (words.some(isForce)) return "force pushes are not allowed";
  if (words.some(pushesEverything))
    return `--all and --mirror would push ${defaultBranch}`;
  if (words.some(targetsDefault))
    return `pushing to ${defaultBranch} is not allowed`;
  return null;
}

// Check each `git ... push ...` in a compound command on its own.
for (const part of command.split(/&&|\|\||[;|&\n]/)) {
  const words = part.trim().split(/\s+/);
  const gitAt = words.indexOf("git");
  const pushAt = words.indexOf("push", gitAt + 1);
  if (gitAt === -1 || pushAt === -1) continue;

  const reason = reasonToBlock(words.slice(pushAt + 1));
  if (reason) {
    console.error(
      `Blocked by .claude/hooks/guard-push.mjs: ${reason}. Push a feature branch and open a PR with /ship.`,
    );
    process.exit(2);
  }
}
