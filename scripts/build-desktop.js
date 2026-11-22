import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const desktopOutputDir = path.join(rootDir, "dist-desktop");
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));

console.log("=== Daily Spark Standalone Desktop Packaging Pipeline ===");

// 1. Ensure dist/ exists
if (!fs.existsSync(distDir)) {
  console.log("Building web application first...");
  execSync("npm run build", { stdio: "inherit", cwd: rootDir });
}

// 2. Prepare dist-desktop directory
if (fs.existsSync(desktopOutputDir)) {
  fs.rmSync(desktopOutputDir, { recursive: true, force: true });
}
fs.mkdirSync(desktopOutputDir, { recursive: true });

const version = packageJson.version;
const windowsDir = path.join(desktopOutputDir, `Daily-Spark-${version}-windows`);
const linuxDir = path.join(desktopOutputDir, `Daily-Spark-${version}-linux`);

fs.mkdirSync(windowsDir, { recursive: true });
fs.mkdirSync(linuxDir, { recursive: true });

// Copy dist files into each package's app directory
function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    if (/^Daily-Spark-v.*\.(apk|exe|zip|tar\.gz)$/i.test(element)) return;
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

console.log("Bundling production web assets into desktop runners...");
copyFolderSync(distDir, path.join(windowsDir, "resources", "app"));
copyFolderSync(distDir, path.join(linuxDir, "resources", "daily-spark"));

// -------------------------------------------------------------
// WINDOWS DESKTOP PACKAGE
// -------------------------------------------------------------
console.log("Building Windows Standalone Executable & Package...");

// Generate Windows native C# launcher source
const csharpSource = `
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;

namespace DailySpark
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "app");
            string indexPath = Path.Combine(appDir, "index.html");

            if (!File.Exists(indexPath))
            {
                MessageBox.Show("Daily Spark assets not found at: " + indexPath, "Daily Spark Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            // Start lightweight local server on random available loopback port
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();

            HttpListener listener = new HttpListener();
            string prefix = string.Format("http://localhost:{0}/", port);
            listener.Prefixes.Add(prefix);
            try
            {
                listener.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not start local offline listener: " + ex.Message, "Daily Spark", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                Process.Start(indexPath);
                return;
            }

            // Background HTTP server thread for static asset delivery with zero internet
            System.Threading.ThreadPool.QueueUserWorkItem((o) =>
            {
                while (listener.IsListening)
                {
                    try
                    {
                        var context = listener.GetContext();
                        System.Threading.ThreadPool.QueueUserWorkItem((ctxObj) =>
                        {
                            var ctx = (HttpListenerContext)ctxObj;
                            try
                            {
                                string rawPath = ctx.Request.Url.AbsolutePath.TrimStart('/');
                                if (string.IsNullOrEmpty(rawPath)) rawPath = "index.html";
                                if (rawPath.StartsWith("daily-spark/")) rawPath = rawPath.Substring("daily-spark/".Length);
                                if (string.IsNullOrEmpty(rawPath)) rawPath = "index.html";

                                string filePath = Path.Combine(appDir, rawPath.Replace('/', Path.DirectorySeparatorChar));
                                if (!File.Exists(filePath))
                                {
                                    // SPA fallback to index.html for client-side routing
                                    filePath = Path.Combine(appDir, "index.html");
                                }

                                byte[] bytes = File.ReadAllBytes(filePath);
                                string ext = Path.GetExtension(filePath).ToLower();
                                if (ext == ".html") ctx.Response.ContentType = "text/html; charset=utf-8";
                                else if (ext == ".js") ctx.Response.ContentType = "application/javascript; charset=utf-8";
                                else if (ext == ".css") ctx.Response.ContentType = "text/css; charset=utf-8";
                                else if (ext == ".svg") ctx.Response.ContentType = "image/svg+xml";
                                else if (ext == ".png") ctx.Response.ContentType = "image/png";
                                else if (ext == ".ico") ctx.Response.ContentType = "image/x-icon";
                                else if (ext == ".json") ctx.Response.ContentType = "application/json";

                                ctx.Response.ContentLength64 = bytes.Length;
                                ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
                                ctx.Response.OutputStream.Close();
                            }
                            catch
                            {
                                try { ctx.Response.StatusCode = 500; ctx.Response.Close(); } catch { }
                            }
                        }, context);
                    }
                    catch
                    {
                        break;
                    }
                }
            });

            // Open in the user's modern default browser. A tray icon owns the
            // local-only server and provides an explicit, discoverable exit.
            NotifyIcon tray = new NotifyIcon();
            tray.Icon = SystemIcons.Application;
            tray.Text = "Daily Spark";
            tray.Visible = true;
            ContextMenu menu = new ContextMenu();
            menu.MenuItems.Add("Open Daily Spark", (s, e) => Process.Start(prefix + "daily-spark/app"));
            menu.MenuItems.Add("Exit", (s, e) =>
            {
                try { listener.Stop(); } catch { }
                tray.Visible = false;
                Application.Exit();
            });
            tray.ContextMenu = menu;
            tray.ShowBalloonTip(2500, "Daily Spark is ready", "Running privately in your default browser.", ToolTipIcon.Info);
            Process.Start(prefix + "daily-spark/app");
            Application.ApplicationExit += (s, e) => { try { listener.Stop(); } catch { } tray.Dispose(); };
            Application.Run();
        }
    }
}
`;

const csFile = path.join(desktopOutputDir, "DailySpark.cs");
fs.writeFileSync(csFile, csharpSource, "utf-8");

const cscPath = "C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe";
const winExePath = path.join(windowsDir, "Daily-Spark.exe");

if (fs.existsSync(cscPath)) {
  try {
    execSync(`"${cscPath}" /target:winexe /optimize+ /out:"${winExePath}" /r:System.Windows.Forms.dll,System.Drawing.dll "${csFile}"`, {
      stdio: "inherit",
    });
    console.log("Compiled native Daily-Spark.exe successfully!");
  } catch (err) {
    console.warn("CSC compilation note:", err.message);
  }
}

// Windows batch portable launcher
const winBat = `@echo off
start "" "%~dp0Daily-Spark.exe"
if %errorlevel% neq 0 (
  start "" "%~dp0resources\\app\\index.html"
)
`;
fs.writeFileSync(path.join(windowsDir, "Launch-Daily-Spark.bat"), winBat, "utf-8");

// Create Windows Zip package
const winZipPath = path.join(desktopOutputDir, `Daily-Spark-v${version}-windows.zip`);
console.log(`Packaging ${winZipPath}...`);
execSync(`powershell -Command "Compress-Archive -Path '${windowsDir}\\*' -DestinationPath '${winZipPath}' -Force"`, {
  stdio: "inherit",
});

// -------------------------------------------------------------
// LINUX DESKTOP PACKAGE
// -------------------------------------------------------------
console.log("Building Linux Standalone Package (.tar.gz)...");

// Linux shell launcher
const linuxSh = `#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
SERVE_DIR="$SCRIPT_DIR/resources"
PORT=8765

if ! command -v python3 >/dev/null 2>&1; then
  echo "Daily Spark needs Python 3 to run its local offline server."
  echo "You can also use the web app at https://dailyspark.sahayasavari.dev/app"
  exit 1
fi

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$SERVE_DIR" >/tmp/daily-spark.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM
sleep 1
APP_URL="http://127.0.0.1:$PORT/daily-spark/app"

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$APP_URL"
elif command -v sensible-browser >/dev/null 2>&1; then
  sensible-browser "$APP_URL"
else
  firefox "$APP_URL" || google-chrome "$APP_URL" || chromium-browser "$APP_URL"
fi

wait "$SERVER_PID"
`;
const shPath = path.join(linuxDir, "daily-spark.sh");
fs.writeFileSync(shPath, linuxSh, { encoding: "utf-8", mode: 0o755 });

// Linux XDG .desktop entry
const desktopFile = `[Desktop Entry]
Name=Daily Spark
Comment=Calm, offline-first habit and streak tracker
Exec=sh -c '"$(dirname "%k")/daily-spark.sh"'
Icon=daily-spark
Terminal=false
Type=Application
Categories=Utility;Office;Health;
`;
fs.writeFileSync(path.join(linuxDir, "daily-spark.desktop"), desktopFile, "utf-8");

// Create Linux .tar.gz package
const linuxTarPath = path.join(desktopOutputDir, `Daily-Spark-v${version}-linux.tar.gz`);
console.log(`Packaging ${linuxTarPath}...`);
execSync(`tar -czf "${linuxTarPath}" -C "${desktopOutputDir}" "Daily-Spark-${version}-linux"`, {
  stdio: "inherit",
});

// Copy compiled Windows executable to dist-desktop root for direct single-file download
if (fs.existsSync(winExePath)) {
  fs.copyFileSync(winExePath, path.join(desktopOutputDir, `Daily-Spark-v${version}-windows.exe`));
}

// Clean up intermediate uncompressed dirs to save space
console.log("\nDesktop packages generated successfully in dist-desktop/:\n");
fs.readdirSync(desktopOutputDir).forEach((f) => {
  const stat = fs.statSync(path.join(desktopOutputDir, f));
  console.log(` - ${f} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
});
