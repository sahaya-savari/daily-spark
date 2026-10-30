import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const androidPublicDir = path.resolve(projectRoot, 'android/app/src/main/assets/public');

if (fs.existsSync(androidPublicDir)) {
  const files = fs.readdirSync(androidPublicDir, { recursive: true });
  const forbiddenExts = ['.exe', '.zip', '.tar.gz', '.tar', '.apk'];
  let removedCount = 0;

  for (const file of files) {
    if (typeof file === 'string') {
      const fullPath = path.join(androidPublicDir, file);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const lower = file.toLowerCase();
        if (forbiddenExts.some((ext) => lower.endsWith(ext))) {
          fs.unlinkSync(fullPath);
          console.log(`🧹 Removed heavy desktop/binary asset from Android assets: ${file}`);
          removedCount++;
        }
      }
    }
  }

  // Synchronize index.html metadata in Android assets
  const androidIndexHtml = path.join(androidPublicDir, 'index.html');
  if (fs.existsSync(androidIndexHtml)) {
    let content = fs.readFileSync(androidIndexHtml, 'utf8');
    if (content.includes('11547497')) {
      content = content.replace(/"fileSize":\s*"11547497"/g, '"fileSize": "4442803"');
      fs.writeFileSync(androidIndexHtml, content, 'utf8');
      console.log('✅ Synchronized fileSize in android/app/src/main/assets/public/index.html to 4442803');
    }
  }

  console.log(`✅ Android public assets cleaned (${removedCount} heavy files purged).`);
} else {
  console.log('ℹ️ Android public assets directory does not exist yet. Skipping cleanup.');
}

