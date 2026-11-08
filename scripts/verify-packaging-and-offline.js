import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const desktopDir = path.join(rootDir, "dist-desktop");

console.log("=== EMPIRICAL CHALLENGER: PACKAGING & OFFLINE VERIFICATION ===");

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// -------------------------------------------------------------
// 1. OFFLINE STATIC PRE-RENDERING
// -------------------------------------------------------------
console.log("\n[1] Verifying Offline Route Static HTML Generation...");
const offlineHtmlPath = path.join(distDir, "offline", "index.html");
assert(fs.existsSync(offlineHtmlPath), "dist/offline/index.html exists");

if (fs.existsSync(offlineHtmlPath)) {
  const content = fs.readFileSync(offlineHtmlPath, "utf-8");
  assert(content.includes("<title>Offline - Daily Spark</title>"), "Contains <title>Offline - Daily Spark</title>");
  assert(content.includes('<meta name="robots" content="noindex" />'), "Contains <meta name=\"robots\" content=\"noindex\" />");
  const expectedBase = process.env.VITE_BASE_PATH ?? '/daily-spark/';
  assert(content.includes(expectedBase), `Contains host-absolute ${expectedBase} asset paths`);
}

// -------------------------------------------------------------
// 2. WINDOWS STANDALONE EXECUTABLE
// -------------------------------------------------------------
console.log("\n[2] Verifying Windows Standalone Executable (Daily-Spark-v1.0.1-windows.exe)...");
const exePath = path.join(desktopDir, "Daily-Spark-v1.0.1-windows.exe");
assert(fs.existsSync(exePath), "dist-desktop/Daily-Spark-v1.0.1-windows.exe exists");

if (fs.existsSync(exePath)) {
  const stat = fs.statSync(exePath);
  assert(stat.size > 4096, `Executable size is ${stat.size} bytes (> 4096 bytes)`);

  const fd = fs.openSync(exePath, "r");
  const buffer = Buffer.alloc(2);
  fs.readSync(fd, buffer, 0, 2, 0);
  fs.closeSync(fd);
  const isMZ = buffer[0] === 0x4d && buffer[1] === 0x5a;
  assert(isMZ, `Executable has DOS/PE magic header 'MZ' (0x4D, 0x5A)`);
}

// -------------------------------------------------------------
// 3. WINDOWS ZIP PACKAGE
// -------------------------------------------------------------
console.log("\n[3] Verifying Windows Zip Package (Daily-Spark-v1.0.1-windows.zip)...");
const zipPath = path.join(desktopDir, "Daily-Spark-v1.0.1-windows.zip");
assert(fs.existsSync(zipPath), "dist-desktop/Daily-Spark-v1.0.1-windows.zip exists");

if (fs.existsSync(zipPath)) {
  const stat = fs.statSync(zipPath);
  assert(stat.size > 10 * 1024 * 1024, `Zip package size is ${(stat.size / 1024 / 1024).toFixed(2)} MB (> 10 MB)`);

  try {
    const list = execSync(`tar -tf "${zipPath}"`, { encoding: "utf-8" });
    assert(list.includes("Daily-Spark.exe"), "Zip package contains Daily-Spark.exe");
    assert(list.includes("Launch-Daily-Spark.bat"), "Zip package contains Launch-Daily-Spark.bat");
    assert(list.includes("resources/app/index.html"), "Zip package contains resources/app/index.html");
    assert(list.includes("resources/app/offline/index.html"), "Zip package contains resources/app/offline/index.html");
  } catch (err) {
    assert(false, `Failed to inspect zip package entries: ${err.message}`);
  }
}

// -------------------------------------------------------------
// 4. LINUX TAR.GZ PACKAGE
// -------------------------------------------------------------
console.log("\n[4] Verifying Linux Tar.gz Package (Daily-Spark-v1.0.1-linux.tar.gz)...");
const tarPath = path.join(desktopDir, "Daily-Spark-v1.0.1-linux.tar.gz");
assert(fs.existsSync(tarPath), "dist-desktop/Daily-Spark-v1.0.1-linux.tar.gz exists");

if (fs.existsSync(tarPath)) {
  const stat = fs.statSync(tarPath);
  assert(stat.size > 10 * 1024 * 1024, `Tar.gz package size is ${(stat.size / 1024 / 1024).toFixed(2)} MB (> 10 MB)`);

  try {
    const list = execSync(`tar -ztf "${tarPath}"`, { encoding: "utf-8" });
    assert(list.includes("daily-spark.sh"), "Tar.gz package contains daily-spark.sh");
    assert(list.includes("daily-spark.desktop"), "Tar.gz package contains daily-spark.desktop");
    assert(list.includes("resources/app/index.html"), "Tar.gz package contains resources/app/index.html");
    assert(list.includes("resources/app/offline/index.html"), "Tar.gz package contains resources/app/offline/index.html");
  } catch (err) {
    assert(false, `Failed to inspect tar.gz package entries: ${err.message}`);
  }
}

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL EMPIRICAL PACKAGING & OFFLINE CHECKS PASSED!");
  process.exit(0);
} else {
  console.error(`🚨 ${failures} VERIFICATION CHECK(S) FAILED!`);
  process.exit(1);
}
