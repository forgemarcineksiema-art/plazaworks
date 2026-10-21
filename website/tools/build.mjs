import { spawnSync } from "node:child_process";
for (const args of [["build:static"], ["build:server"]]) {
  const result = spawnSync("npm", ["run", ...args], { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
}
