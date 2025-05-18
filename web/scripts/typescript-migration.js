#!/usr/bin/env node

/**
 * typescript-migration.js
 *
 * JavaScript 파일을 TypeScript로 자동 변환하는 스크립트
 * - .js 파일 중 JSX를 포함하는 파일을 .tsx로 변환
 * - .js 파일 중 JSX를 포함하지 않는 파일을 .ts로 변환
 * - 해당 파일을 임포트하는 모든 파일의 import 경로 업데이트
 */

const fs = require("fs");
const path = require("path");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const rename = util.promisify(fs.rename);
const stat = util.promisify(fs.stat);

// 설정
const CONFIG = {
  rootDir: path.resolve(__dirname, "../src"),
  dryRun: process.argv.includes("--dry-run"),
  verbose: process.argv.includes("--verbose"),
  targetDir: process.argv.includes("--target")
    ? process.argv[process.argv.indexOf("--target") + 1]
    : null,
};

// JSX를 포함하는지 확인하는 정규식
const JSX_REGEX =
  /(<\s*([a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*|\{.*?\})(\s+.*?)*>|<\s*\/\s*([a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*|\{.*?\})(\s+.*?)*>)/;

// React import나 JSX 관련 코드가 있는지 확인하는 정규식
const REACT_IMPORT_REGEX =
  /import\s+.*?React.*?from\s+['"]react['"]|import\s+.*?from\s+['"]react-dom['"]|extends\s+React\.Component|extends\s+Component|React\.createElement|React\.cloneElement/;

// 변환 결과 기록
const migrationStats = {
  jsxFilesConverted: 0,
  nonJsxFilesConverted: 0,
  importsUpdated: 0,
  errors: [],
};

// 변환된 파일 맵 (import 경로 업데이트용)
const convertedFilesMap = new Map();

/**
 * 디렉토리 내의 모든 파일을 재귀적으로 탐색
 */
async function traverseDirectory(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        // node_modules, build 등은 제외
        if (
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules" &&
          entry.name !== "build"
        ) {
          await traverseDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        // .test.js, .spec.js 파일은 처리하지 않음
        if (!entry.name.endsWith(".test.js") && !entry.name.endsWith(".spec.js")) {
          await processJavaScriptFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error traversing directory ${directory}:`, error);
    migrationStats.errors.push({ path: directory, error: error.message });
  }
}

/**
 * JavaScript 파일을 분석하여 적절한 TypeScript 파일(.ts 또는 .tsx)로 변환
 */
async function processJavaScriptFile(filePath) {
  try {
    // 특정 디렉토리만 처리하는 옵션이 있으면 확인
    if (CONFIG.targetDir && !filePath.includes(CONFIG.targetDir)) {
      return;
    }

    // 파일 내용 읽기
    const content = await readFile(filePath, "utf8");

    // JSX 또는 React 관련 코드 포함 여부 확인
    const hasJSX = JSX_REGEX.test(content);
    const hasReactImport = REACT_IMPORT_REGEX.test(content);
    const isReactComponent = hasJSX || hasReactImport;

    // 새 파일 확장자 결정
    const newExtension = isReactComponent ? ".tsx" : ".ts";
    const newFilePath = filePath.replace(/\.js$/, newExtension);

    // 변환된 파일 경로 맵에 추가
    const relativeOldPath = path.relative(CONFIG.rootDir, filePath);
    const relativeNewPath = path.relative(CONFIG.rootDir, newFilePath);
    convertedFilesMap.set(relativeOldPath, relativeNewPath);

    if (CONFIG.verbose) {
      console.log(`Converting: ${filePath} -> ${newFilePath}`);
    }

    // Dry run 모드가 아니면 파일 이름 변경
    if (!CONFIG.dryRun) {
      await rename(filePath, newFilePath);

      if (isReactComponent) {
        migrationStats.jsxFilesConverted++;
      } else {
        migrationStats.nonJsxFilesConverted++;
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    migrationStats.errors.push({ path: filePath, error: error.message });
  }
}

/**
 * 모든 파일의 import 경로 업데이트
 */
async function updateImportPaths() {
  try {
    console.log("Updating import paths...");

    // 모든 .ts, .tsx, .js 파일에서 import 경로 업데이트
    await traverseDirectoryForImportUpdates(CONFIG.rootDir);

    console.log("Import paths updated successfully.");
  } catch (error) {
    console.error("Error updating import paths:", error);
    migrationStats.errors.push({ path: "Import update process", error: error.message });
  }
}

/**
 * import 경로 업데이트를 위한 디렉토리 탐색
 */
async function traverseDirectoryForImportUpdates(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        // node_modules, build 등은 제외
        if (
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules" &&
          entry.name !== "build"
        ) {
          await traverseDirectoryForImportUpdates(fullPath);
        }
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".js"))
      ) {
        await updateFileImports(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error traversing directory for import updates ${directory}:`, error);
    migrationStats.errors.push({ path: directory, error: error.message });
  }
}

/**
 * 파일의 import 문을 업데이트
 */
async function updateFileImports(filePath) {
  try {
    // 파일 내용 읽기
    const content = await readFile(filePath, "utf8");
    let newContent = content;
    let importsUpdated = false;

    // 모든 import 문에 대해 변환된 경로로 업데이트
    convertedFilesMap.forEach((newRelativePath, oldRelativePath) => {
      // import 문에서 확장자가 포함된 경우와 포함되지 않은 경우 모두 처리
      const importWithExt = new RegExp(
        `import\\s+.*?from\\s+['"](.+?/${oldRelativePath.replace(/\.js$/, "")}(.js)?)['"]`,
        "g"
      );
      const importWithoutExt = new RegExp(
        `import\\s+.*?from\\s+['"](.+?\/${path.basename(oldRelativePath, ".js")})['"]`,
        "g"
      );

      // 매치되는 경우 확장자를 업데이트
      if (importWithExt.test(newContent) || importWithoutExt.test(newContent)) {
        // 새 확장자 (경로 끝의 .js를 제거하고 import 시에는 확장자 생략)
        newContent = newContent.replace(importWithExt, (match, p1) => {
          return match.replace(p1, p1.replace(/\.js$/, ""));
        });

        newContent = newContent.replace(importWithoutExt, (match, p1) => {
          return match; // 확장자가 없는 경우는 그대로 유지
        });

        importsUpdated = true;
      }
    });

    // 변경사항이 있을 경우만 파일 업데이트
    if (importsUpdated && !CONFIG.dryRun) {
      await writeFile(filePath, newContent, "utf8");
      migrationStats.importsUpdated++;

      if (CONFIG.verbose) {
        console.log(`Updated imports in: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error updating imports in file ${filePath}:`, error);
    migrationStats.errors.push({ path: filePath, error: error.message });
  }
}

/**
 * 결과 보고서 출력
 */
function printSummary() {
  console.log("\n===== TypeScript Migration Summary =====");
  console.log(`JSX Components converted to .tsx: ${migrationStats.jsxFilesConverted}`);
  console.log(`Non-JSX files converted to .ts: ${migrationStats.nonJsxFilesConverted}`);
  console.log(`Files with updated imports: ${migrationStats.importsUpdated}`);
  console.log(
    `Total files processed: ${
      migrationStats.jsxFilesConverted + migrationStats.nonJsxFilesConverted
    }`
  );
  console.log(`Errors encountered: ${migrationStats.errors.length}`);

  if (migrationStats.errors.length > 0) {
    console.log("\nErrors:");
    migrationStats.errors.forEach((err, index) => {
      console.log(`${index + 1}. ${err.path}: ${err.error}`);
    });
  }

  console.log(
    "\nNote: Please manually review the converted files for any required TypeScript-specific changes."
  );
  console.log("======================================\n");
}

/**
 * 메인 함수
 */
async function main() {
  console.log("Starting TypeScript migration...");
  console.log(`Root directory: ${CONFIG.rootDir}`);
  console.log(`Dry run: ${CONFIG.dryRun ? "Yes" : "No"}`);
  console.log(`Target directory: ${CONFIG.targetDir || "All"}`);

  // 1단계: JavaScript 파일 변환
  await traverseDirectory(CONFIG.rootDir);

  // 2단계: import 경로 업데이트
  await updateImportPaths();

  // 결과 출력
  printSummary();

  if (CONFIG.dryRun) {
    console.log("This was a dry run. No files were actually modified.");
    console.log("Run without --dry-run flag to perform the actual migration.");
  }
}

// 스크립트 실행
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
