#!/usr/bin/env node

/**
 * Sync version from package.json to Android build.gradle
 * 
 * Converts semantic version (e.g., 1.0.3) to Android versionCode (e.g., 100003)
 * Formula: (major * 100000) + (minor * 1000) + patch
 * 
 * Run this before building Android APK
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // Read package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  // Parse semantic version
  const parts = version.split('.');
  const major = parseInt(parts[0], 10) || 0;
  const minor = parseInt(parts[1], 10) || 0;
  const patch = parseInt(parts[2], 10) || 0;

  // Calculate version code
  const versionCode = (major * 100000) + (minor * 1000) + patch;

  console.log(`📱 Syncing version: ${version}`);
  console.log(`📌 Version Code: ${versionCode}`);

  // Read build.gradle - note the correct path with 'android/app/build.gradle'
  const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf-8');

  // Update versionCode
  buildGradle = buildGradle.replace(
    /versionCode\s+\d+/,
    `versionCode ${versionCode}`
  );

  // Update versionName
  buildGradle = buildGradle.replace(
    /versionName\s+"[\d.]+"/,
    `versionName "${version}"`
  );

  // Write back
  fs.writeFileSync(buildGradlePath, buildGradle, 'utf-8');

  console.log('✅ build.gradle updated successfully');
  console.log('🚀 Ready to build with: npm run build -- --mode capacitor');
} catch (error) {
  console.error('❌ Version sync failed:', error.message);
  process.exit(1);
}
