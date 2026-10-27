import fs from 'fs';
import path from 'path';

const dist = path.resolve(import.meta.dirname, '../dist');
const indexHtml = path.join(dist, 'index.html');
const notFoundHtml = path.join(dist, '404.html');

if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, notFoundHtml);
  console.log('✓ Created dist/404.html for GitHub Pages SPA routing');

  const routes = ['download', 'features', 'screens', 'get', 'privacy', 'app'];
  for (const r of routes) {
    const dir = path.join(dist, r);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(indexHtml, path.join(dir, 'index.html'));
  }
  console.log(`✓ Generated static route entries for: ${routes.join(', ')}`);
}
