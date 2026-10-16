import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL é obrigatória para executar migrations.");

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: process.env.DATABASE_SSL === "disable" ? false : "require",
});

try {
  await sql`
    CREATE TABLE IF NOT EXISTS bella_schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  const migrationDirectory = resolve("migrations");
  const filenames = (await readdir(migrationDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  for (const filename of filenames) {
    const source = await readFile(resolve(migrationDirectory, filename), "utf8");
    const checksum = createHash("sha256").update(source).digest("hex");
    const existing =
      await sql`SELECT checksum FROM bella_schema_migrations WHERE filename = ${filename}`;
    if (existing.length) {
      if (existing[0].checksum !== checksum)
        throw new Error(`Migration já aplicada foi alterada: ${filename}`);
      console.log(`skip ${filename}`);
      continue;
    }
    await sql.begin(async (transaction) => {
      await transaction.unsafe(source);
      await transaction`
        INSERT INTO bella_schema_migrations (filename, checksum) VALUES (${filename}, ${checksum})
      `;
    });
    console.log(`applied ${filename}`);
  }
} finally {
  await sql.end();
}
