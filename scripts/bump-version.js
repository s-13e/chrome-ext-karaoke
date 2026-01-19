/**
 * Version Bump Script
 *
 * Synchronizes version updates between package.json and manifest.json.
 * Supports semantic versioning (major, minor, patch).
 *
 * Usage:
 *   node scripts/bump-version.js patch   # 1.0.0 → 1.0.1
 *   node scripts/bump-version.js minor   # 1.0.0 → 1.1.0
 *   node scripts/bump-version.js major   # 1.0.0 → 2.0.0
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const MANIFEST_JSON_PATH = path.join(__dirname, '..', 'manifest.json');

const VALID_BUMP_TYPES = ['major', 'minor', 'patch'];

/**
 * Parses a semantic version string into its components
 * @param {string} version - Version string (e.g., "1.0.0")
 * @returns {{ major: number, minor: number, patch: number }}
 */
function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

/**
 * Bumps the version based on the specified type
 * @param {string} currentVersion - Current version string
 * @param {string} bumpType - Type of bump (major, minor, patch)
 * @returns {string} New version string
 */
function bumpVersion(currentVersion, bumpType) {
  const { major, minor, patch } = parseVersion(currentVersion);

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${bumpType}`);
  }
}

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {object} Parsed JSON object
 */
function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Writes an object to a JSON file with proper formatting
 * @param {string} filePath - Path to JSON file
 * @param {object} data - Data to write
 */
function writeJsonFile(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Main execution
 */
function main() {
  const bumpType = process.argv[2];

  if (!bumpType) {
    console.error('Error: Please specify bump type (major, minor, patch)');
    console.error('Usage: node scripts/bump-version.js <major|minor|patch>');
    process.exit(1);
  }

  if (!VALID_BUMP_TYPES.includes(bumpType)) {
    console.error(`Error: Invalid bump type "${bumpType}"`);
    console.error(`Valid types: ${VALID_BUMP_TYPES.join(', ')}`);
    process.exit(1);
  }

  // Read current versions
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  const manifestJson = readJsonFile(MANIFEST_JSON_PATH);

  const currentVersion = packageJson.version;

  if (!currentVersion) {
    console.error('Error: No version field found in package.json');
    process.exit(1);
  }

  // Check version sync
  if (manifestJson.version !== currentVersion) {
    console.warn(
      `Warning: Version mismatch detected (package.json: ${currentVersion}, manifest.json: ${manifestJson.version})`,
    );
    console.warn('Proceeding with package.json version as source of truth.\n');
  }

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, bumpType);

  // Update both files
  packageJson.version = newVersion;
  manifestJson.version = newVersion;

  writeJsonFile(PACKAGE_JSON_PATH, packageJson);
  writeJsonFile(MANIFEST_JSON_PATH, manifestJson);

  console.log(`Version bumped: ${currentVersion} → ${newVersion}`);
  console.log('Updated files:');
  console.log('  - package.json');
  console.log('  - manifest.json');
}

main();
