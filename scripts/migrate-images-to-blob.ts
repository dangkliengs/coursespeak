import { createReadStream } from "fs";
import { readdir, stat, writeFile } from "fs/promises";
import path from "path";
import { list, put } from "@vercel/blob";
import { config as loadEnv } from "dotenv";

loadEnv();
loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const SOURCE_ROOT = path.resolve("public/wp-content");
const OUTPUT_MAPPING = path.resolve("scripts", "migrated-images.json");

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN environment variable.");
  process.exit(1);
}

const token = process.env.BLOB_READ_WRITE_TOKEN;

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

async function getExisting(prefix: string) {
  const existing = new Map<string, string>();
  let cursor: string | undefined;
  do {
    const result = await list({ token, prefix, cursor, limit: 1000 });
    for (const blob of result.blobs) {
      existing.set(blob.pathname, blob.url);
    }
    cursor = result.cursor;
  } while (cursor);
  return existing;
}

async function main() {
  const existing = await getExisting("wp-content/");
  const mapping: Array<{ localPath: string; blobPath: string; url: string }> = [];
  let count = 0;

  for await (const filePath of walk(SOURCE_ROOT)) {
    const stats = await stat(filePath);
    if (!stats.isFile()) continue;

    const relativePath = path.relative("public", filePath).replace(/\\/g, "/");
    const blobPath = relativePath;

    let url = existing.get(blobPath);
    if (!url) {
      const fileStream = createReadStream(filePath);
      const result = await put(blobPath, fileStream, {
        access: "public",
        token,
        addRandomSuffix: false,
      });
      url = result.url;
      existing.set(blobPath, url);
    }

    mapping.push({ localPath: relativePath, blobPath, url });
    count += 1;
    if (count % 50 === 0) {
      console.log(`Processed ${count} files... last: ${relativePath}`);
    }
  }

  await writeFile(OUTPUT_MAPPING, JSON.stringify(mapping, null, 2), "utf-8");
  console.log(`Done. Uploaded ${count} files. Mapping saved to ${OUTPUT_MAPPING}`);
}

main().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
