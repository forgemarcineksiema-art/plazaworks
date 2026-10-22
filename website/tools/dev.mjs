import { spawnSync, spawn } from "node:child_process";
const result = spawnSync("npm", ["run", "build:static"], { stdio: "inherit", env: process.env });
if (result.status !== 0) process.exit(result.status || 1);
const child = spawn(process.execPath, ["scripts/run-framework.mjs", "dev", ...process.argv.slice(2)], { stdio: "inherit", env: process.env });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => process.exit(code || 0));
