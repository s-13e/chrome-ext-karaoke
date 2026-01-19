/**
 * Extension Packaging Script
 *
 * Creates a zip file from the dist folder for Chrome Web Store submission.
 * The zip file is created in the project root with the format:
 * youtube-karaoke-v{version}.zip
 *
 * Usage:
 *   node scripts/package-extension.js
 *   npm run package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');

/**
 * Gets the current version from package.json
 * @returns {string} Version string
 */
function getVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  return packageJson.version;
}

/**
 * Checks if dist folder exists and has content
 * @returns {boolean}
 */
function validateDistFolder() {
  if (!fs.existsSync(DIST_DIR)) {
    return false;
  }

  const files = fs.readdirSync(DIST_DIR);
  return files.length > 0;
}

/**
 * Creates zip file using PowerShell (Windows) or zip command (Unix)
 * @param {string} outputPath - Path for the output zip file
 */
function createZip(outputPath) {
  // Remove existing zip if present
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log(`Removed existing: ${path.basename(outputPath)}`);
  }

  const isWindows = process.platform === 'win32';

  if (isWindows) {
    // Use PowerShell's Compress-Archive on Windows
    const command = `powershell -Command "Compress-Archive -Path '${DIST_DIR}\\*' -DestinationPath '${outputPath}' -Force"`;
    execSync(command, { stdio: 'inherit' });
  } else {
    // Use zip command on Unix-like systems
    const command = `cd "${DIST_DIR}" && zip -r "${outputPath}" .`;
    execSync(command, { stdio: 'inherit', shell: '/bin/bash' });
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Packaging extension for Chrome Web Store...\n');

  // Validate dist folder
  if (!validateDistFolder()) {
    console.error('Error: dist folder is empty or does not exist.');
    console.error('Please run "npm run build" first.');
    process.exit(1);
  }

  // Get version and create output path
  const version = getVersion();
  const zipFileName = `youtube-karaoke-v${version}.zip`;
  const outputPath = path.join(ROOT_DIR, zipFileName);

  // Create zip
  console.log(`Creating ${zipFileName}...`);
  createZip(outputPath);

  // Verify and show result
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\nPackaging complete!');
    console.log(`  File: ${zipFileName}`);
    console.log(`  Size: ${sizeMB} MB`);
    console.log(`  Path: ${outputPath}`);
    console.log('\nReady for Chrome Web Store submission.');
  } else {
    console.error('\nError: Failed to create zip file.');
    process.exit(1);
  }
}

main();
