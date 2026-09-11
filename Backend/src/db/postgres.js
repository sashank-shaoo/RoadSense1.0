import postgres from "postgres";

// Database client instance
export let sql;

export function createDatabase(config) {
  sql = postgres({
    host: config.DB_HOST,
    port: Number(config.DB_PORT || 5432),
    database: config.DB_NAME,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    ssl: "require",
  });
  return sql;
}

export default function getSql() {
  return sql;
}
