/**
 * i18n Validation Script
 *
 * Validates translation files by:
 * 1. Comparing all language files against English (source of truth)
 * 2. Finding keys used in code but missing from translation files
 * 3. Finding keys in translation files but not used in code
 *
 * Detects both direct t('key') calls and dynamic key usage patterns:
 * - Config objects with labelKey/titleKey/descKey properties
 * - Switch/case return statements with key literals
 * - manifest.json __MSG_key__ references
 *
 * Usage:
 *   node scripts/validate-i18n.js
 *   npm run validate:i18n
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'src', 'locales');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const SOURCE_LANG = 'en';

/**
 * Gets all JSON files in the locales directory
 * @returns {string[]} Array of language codes
 */
function getLanguages() {
  const files = fs.readdirSync(LOCALES_DIR);
  return files.filter((file) => file.endsWith('.json')).map((file) => file.replace('.json', ''));
}

/**
 * Reads and parses a translation file
 * @param {string} lang - Language code
 * @returns {object} Parsed JSON object
 */
function readTranslationFile(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Gets all keys from a translation object (flattened)
 * @param {object} obj - Translation object
 * @param {string} prefix - Key prefix for nested objects
 * @returns {Set<string>} Set of all keys
 */
function getAllKeys(obj, prefix = '') {
  const keys = new Set();

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedKeys = getAllKeys(obj[key], fullKey);
      nestedKeys.forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

/**
 * Recursively gets all source files
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to include
 * @returns {string[]} Array of file paths
 */
function getSourceFiles(dir, extensions = ['.ts', '.tsx']) {
  const files = [];

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // Skip locales directory to avoid false positives
      if (item.name !== 'locales') {
        files.push(...getSourceFiles(fullPath, extensions));
      }
    } else if (extensions.some((ext) => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extracts translation keys used in source code
 * Detects both direct t() calls and dynamic key usage patterns
 * @returns {Set<string>} Set of used keys
 */
function extractUsedKeys() {
  const usedKeys = new Set();
  const sourceFiles = getSourceFiles(SRC_DIR);

  // Pattern 1: Direct t() calls
  // t('key'), t("key"), t(`key`), i18n.t('key')
  const directPatterns = [/\.t\(\s*['"`]([a-zA-Z0-9_]+)['"`]/g, /\Wt\(\s*['"`]([a-zA-Z0-9_]+)['"`]/g];

  // Pattern 2: Config object properties containing i18n keys
  // labelKey: 'extSomething', titleKey: "extSomething", descKey: `extSomething`
  // shortLabelKey: 'extSomething'
  const configPropertyPattern =
    /(?:labelKey|titleKey|descKey|shortLabelKey|storageKey)\s*:\s*['"`](ext[A-Za-z0-9_]+)['"`]/g;

  // Pattern 3: Switch/case or ternary return values with i18n key literals
  // return 'extSomething'; or ? 'extSomething' : 'extSomething';
  const returnKeyPattern = /(?:return|[?:])\s*['"`](ext[A-Za-z0-9_]+)['"`]\s*[;,):]/g;

  // Pattern 4: String literals assigned to variables (key mapping objects)
  // value: 'extSomething' or icon: 'extSomething'
  const objectValuePattern = /:\s*['"`](ext[A-Za-z0-9_]+)['"`]\s*[,}]/g;

  // Pattern 5: Array literals containing i18n key strings
  // ['extKey1', 'extKey2', ...].map(...)
  const arrayLiteralPattern = /['"`](ext[A-Z][A-Za-z0-9_]+)['"`]\s*[,\]]/g;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Direct t() calls
    for (const pattern of directPatterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }
    }

    // Config property keys (labelKey, titleKey, descKey, shortLabelKey)
    configPropertyPattern.lastIndex = 0;
    let match;
    while ((match = configPropertyPattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }

    // Return/ternary key literals
    returnKeyPattern.lastIndex = 0;
    while ((match = returnKeyPattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }

    // Object value literals (catches remaining config patterns)
    objectValuePattern.lastIndex = 0;
    while ((match = objectValuePattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }

    // Array literal keys
    arrayLiteralPattern.lastIndex = 0;
    while ((match = arrayLiteralPattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  }

  // Pattern 5: manifest.json __MSG_key__ references
  const manifestPath = path.join(ROOT_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifestPattern = /__MSG_([a-zA-Z0-9_]+)__/g;
    let match;
    while ((match = manifestPattern.exec(manifestContent)) !== null) {
      usedKeys.add(match[1]);
    }
  }

  return usedKeys;
}

/**
 * Main validation logic
 */
function main() {
  console.log('Validating i18n translations...\n');

  const languages = getLanguages();
  console.log(`Found ${languages.length} languages: ${languages.join(', ')}\n`);

  // Read all translation files
  const translations = {};
  for (const lang of languages) {
    translations[lang] = readTranslationFile(lang);
  }

  // Get keys from source language
  const sourceKeys = getAllKeys(translations[SOURCE_LANG]);
  console.log(`Source language (${SOURCE_LANG}): ${sourceKeys.size} keys\n`);

  // Compare each language against source
  console.log('=== Missing Keys by Language ===\n');

  let hasMissingKeys = false;

  for (const lang of languages) {
    if (lang === SOURCE_LANG) continue;

    const langKeys = getAllKeys(translations[lang]);
    const missingKeys = [...sourceKeys].filter((key) => !langKeys.has(key));

    if (missingKeys.length > 0) {
      hasMissingKeys = true;
      console.log(`${lang}: ${missingKeys.length} missing keys`);
      missingKeys.slice(0, 10).forEach((key) => console.log(`  - ${key}`));
      if (missingKeys.length > 10) {
        console.log(`  ... and ${missingKeys.length - 10} more`);
      }
      console.log('');
    } else {
      console.log(`${lang}: All keys present`);
    }
  }

  // Extract keys used in code
  console.log('\n=== Code Usage Analysis ===\n');

  const usedKeys = extractUsedKeys();
  console.log(`Keys used in code: ${usedKeys.size}`);

  // Find unused keys (in translation but not in code)
  const unusedKeys = [...sourceKeys].filter((key) => !usedKeys.has(key));

  // Find missing keys (in code but not in translation)
  // Filter to ext* keys only to exclude false positives from non-i18n string matches
  const missingInTranslation = [...usedKeys].filter((key) => !sourceKeys.has(key) && /^ext[A-Z]/.test(key));

  if (missingInTranslation.length > 0) {
    console.log(`\nKeys used in code but missing from ${SOURCE_LANG}.json:`);
    missingInTranslation.forEach((key) => console.log(`  - ${key}`));
  }

  if (unusedKeys.length > 0) {
    console.log(`\nKeys in ${SOURCE_LANG}.json but not found in code:`);
    unusedKeys.forEach((key) => console.log(`  - ${key}`));
  }

  // Summary
  console.log('\n=== Summary ===\n');
  console.log(`Languages: ${languages.length}`);
  console.log(`Total keys in ${SOURCE_LANG}: ${sourceKeys.size}`);
  console.log(`Keys used in code: ${usedKeys.size}`);
  console.log(`Missing in translations: ${hasMissingKeys ? 'Yes' : 'None'}`);
  console.log(`Potentially unused keys: ${unusedKeys.length}`);

  // Exit with error if there are missing keys in code
  if (missingInTranslation.length > 0) {
    console.log('\nValidation failed: Some keys are missing from translations.');
    process.exit(1);
  }

  console.log('\nValidation complete!');
}

main();
