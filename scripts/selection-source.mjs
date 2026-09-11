import { readFile } from "node:fs/promises";
import ts from "typescript";

// Execute the checked-in helper after removing its TypeScript-only syntax.
const source = await readFile(
  new URL("../src/sdk/pokemon-pair.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
});
export const { selectTwoPokemon } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
