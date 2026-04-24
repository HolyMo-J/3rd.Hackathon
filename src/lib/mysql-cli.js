import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function getDatabaseConfig() {
  return {
    host: getEnv("DB_HOST", "localhost"),
    port: getEnv("DB_PORT", "3306"),
    user: getEnv("DB_USER", "testuser"),
    password: getEnv("DB_PASSWORD", "1234"),
    database: getEnv("DB_NAME", "pfm_ledger"),
  };
}

export function escapeSqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return `'${String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")}'`;
}

function parseBatchOutput(stdout) {
  const lines = stdout.trim().split("\n").filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split("\t");

  return lines.slice(1).map((line) => {
    const values = line.split("\t");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

export async function queryRows(sql) {
  const config = getDatabaseConfig();
  const args = [
    `-h${config.host}`,
    `-P${config.port}`,
    `-u${config.user}`,
    config.database,
    "--batch",
    "--raw",
    "-e",
    sql,
  ];

  const { stdout } = await execFileAsync("mysql", args, {
    env: {
      ...process.env,
      MYSQL_PWD: config.password,
    },
  });

  return parseBatchOutput(stdout);
}

export async function executeSql(sql) {
  const config = getDatabaseConfig();
  const args = [
    `-h${config.host}`,
    `-P${config.port}`,
    `-u${config.user}`,
    config.database,
    "-e",
    sql,
  ];

  await execFileAsync("mysql", args, {
    env: {
      ...process.env,
      MYSQL_PWD: config.password,
    },
  });
}
