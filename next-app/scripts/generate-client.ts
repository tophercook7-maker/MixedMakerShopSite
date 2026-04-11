#!/usr/bin/env npx tsx
/**
 * Generate `fresh-cut-property-care/src/data/clients/<clientKey>.ts` from an intake JSON.
 *
 * Run from repo root:
 *   cd next-app && npx tsx scripts/generate-client.ts scripts/intake.example.json
 * Or:
 *   npm run generate:client -- scripts/intake.example.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NicheKey } from "@astro-niche-pack/types/niche";
import type { ClientIntake } from "@/lib/client-site-generator/intake-schema";
import {
  buildIntakeFromNicheDefaults,
  buildClientConfigFromIntake,
  formatClientConfigTsFile,
  validateFullIntake,
} from "@/lib/client-site-generator/generate-client-config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const nextAppRoot = resolve(__dirname, "..");
const repoRoot = resolve(nextAppRoot, "..");
const astroClientsDir = resolve(repoRoot, "fresh-cut-property-care/src/data/clients");

function usage(): never {
  console.error(`Usage (from next-app/):
  npx tsx scripts/generate-client.ts <intake.json> [--write] [--force]

  --write   Write fresh-cut-property-care/src/data/clients/<clientKey>.ts
  --force   Overwrite existing file`);
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  const doWrite = args.includes("--write");
  const doForce = args.includes("--force");
  const fileArg = args.find((a) => !a.startsWith("--"));
  if (!fileArg) usage();

  const raw = JSON.parse(readFileSync(resolve(process.cwd(), fileArg), "utf8")) as Partial<ClientIntake> & {
    nicheKey: NicheKey;
  };
  if (!raw.nicheKey) {
    console.error("intake.json must include nicheKey");
    process.exit(1);
  }

  const intake = buildIntakeFromNicheDefaults(raw);
  const issues = validateFullIntake(intake);
  if (issues.length) {
    console.error("Validation issues:", issues);
    process.exit(1);
  }

  const result = buildClientConfigFromIntake(intake);
  const ts = formatClientConfigTsFile(intake, result);
  const outPath = resolve(astroClientsDir, `${intake.clientKey}.ts`);

  console.log(ts);
  console.log("\n--- Local page slugs ---\n");
  console.log(result.localPageSlugs.join("\n"));
  console.log("\n--- Register in fresh-cut-property-care/src/data/clients/index.ts ---\n");
  console.log(result.registerClientSnippet);

  if (doWrite) {
    if (existsSync(outPath) && !doForce) {
      console.error(`\nRefusing to overwrite ${outPath} (pass --force)`);
      process.exit(1);
    }
    writeFileSync(outPath, ts, "utf8");
    console.error(`\nWrote ${outPath}`);
  }
}

main();
