// Stop: don't let Claude finish while scripts/check.sh fails on uncommitted
// changes. It skips when the tree is clean or unchanged since the last pass, so
// question-and-answer turns cost nothing. Within one turn it blocks at most
// MAX_BLOCKS times, then lets Claude stop with a visible warning, and doesn't
// re-run on that same tree until something changes.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const MAX_BLOCKS = 3;
const OUTPUT_TAIL_LINES = 40;
const MAX_BUFFER = 256 * 1024 * 1024;

const input = JSON.parse(readFileSync(0, "utf8"));
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd;
const git = (...args) =>
  execFileSync("git", args, { cwd: root, maxBuffer: MAX_BUFFER });

if (git("status", "--porcelain").length === 0) process.exit(0);

// Kept outside the repo so it never shows up in git status or Prettier.
const rootId = createHash("sha256").update(root).digest("hex").slice(0, 12);
const stateFile = path.join(os.tmpdir(), `claude-stop-check-${rootId}.json`);
const state = existsSync(stateFile)
  ? JSON.parse(readFileSync(stateFile, "utf8"))
  : {};
const save = (changes) =>
  writeFileSync(stateFile, JSON.stringify({ ...state, ...changes }));

// Identifies the exact uncommitted state: tracked changes plus new files.
function treeFingerprint() {
  const hash = createHash("sha256").update(git("diff", "HEAD", "--binary"));
  const untracked = git("ls-files", "--others", "--exclude-standard", "-z")
    .toString()
    .split("\0")
    .filter(Boolean);
  for (const file of untracked)
    hash.update(file).update(readFileSync(path.join(root, file)));
  return hash.digest("hex");
}

const respond = (output) => console.log(JSON.stringify(output));
const fingerprint = treeFingerprint();

if (fingerprint === state.passed) process.exit(0);
if (fingerprint === state.gaveUp) {
  respond({
    systemMessage:
      "check.sh still fails on these uncommitted changes. Run `bash scripts/check.sh` to see why.",
  });
  process.exit(0);
}

const run = spawnSync("bash", ["-c", "bash scripts/check.sh 2>&1"], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: MAX_BUFFER,
});
if (run.error) throw run.error;

if (run.status === 0) {
  save({ passed: fingerprint, blocks: 0 });
  process.exit(0);
}

// A new turn starts the count again; continuations caused by this hook add to it.
const blocks = input.stop_hook_active ? (state.blocks ?? 0) : 0;
if (blocks >= MAX_BLOCKS) {
  save({ gaveUp: fingerprint, blocks: 0 });
  respond({
    systemMessage: `check.sh still fails after ${MAX_BLOCKS} attempts, so Claude was allowed to stop. Run \`bash scripts/check.sh\` to see the failure.`,
  });
  process.exit(0);
}

const tail = run.stdout
  .replace(/\x1b\[[0-9;]*m/g, "")
  .trimEnd()
  .split("\n")
  .slice(-OUTPUT_TAIL_LINES)
  .join("\n");
save({ blocks: blocks + 1 });
respond({
  decision: "block",
  reason: `scripts/check.sh failed (block ${blocks + 1} of ${MAX_BLOCKS}). Fix it before finishing, or explain why it can't pass.\n\n${tail}`,
});
