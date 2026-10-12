// PostToolUse (Edit|Write): run Prettier on the file Claude just changed, so
// `format:check` never fails on Claude's own edits. Prettier skips files in
// .prettierignore and file types it doesn't know.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const file = input.tool_input?.file_path;
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd;

if (!file || !existsSync(file)) process.exit(0);

// Only files inside this repo (not memory files, scratchpads and the like).
const relative = path.relative(root, file);
if (relative.startsWith("..") || path.isAbsolute(relative)) process.exit(0);

const prettier = path.join(
  root,
  "node_modules",
  "prettier",
  "bin",
  "prettier.cjs",
);
if (!existsSync(prettier)) {
  console.error("format hook: Prettier isn't installed. Run `npm ci`.");
  process.exit(2);
}

const result = spawnSync(
  process.execPath,
  [
    prettier,
    "--write",
    "--ignore-unknown",
    "--log-level",
    "warn",
    relative.split(path.sep).join("/"),
  ],
  { cwd: root, encoding: "utf8" },
);

// Exit 2 shows stderr to Claude, so a file Prettier can't parse gets fixed now.
if (result.error || result.status !== 0) {
  console.error(
    `format hook: Prettier failed on ${relative}\n${result.stderr || result.error}`,
  );
  process.exit(2);
}
