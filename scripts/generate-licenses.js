/**
 * License Generation Script
 *
 * This script automatically generates license information by:
 * 1. Extracting DIRECT npm dependencies only (from package.json)
 * 2. Filtering out build tools, dev tools, and type definitions
 * 3. Parsing README.md for manually specified fonts
 * 4. Combining all into a TypeScript file for the UI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const README_PATH = path.join(ROOT_DIR, 'README.md');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'constants', 'generatedLicenses.ts');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');

// 제외할 패키지 패턴 (빌드 도구, 개발 도구, 타입 정의 등)
const EXCLUDED_PATTERNS = [
  /^@types\//, // TypeScript 타입 정의
  /^@babel\//, // Babel 빌드 도구
  /^@webpack/, // Webpack
  /^@eslint/, // ESLint
  /^eslint/, // ESLint
  /^prettier/, // Prettier
  /^typescript/, // TypeScript 컴파일러
  /loader$/, // 웹팩 로더들
  /plugin$/, // 플러그인들
  /-webpack-plugin$/, // 웹팩 플러그인
  /^webpack/, // Webpack 관련
  /^ts-/, // TypeScript 도구들
  /^@svgr\//, // SVGR
  /^chokidar/, // 파일 워처
  /^clean-/, // 빌드 정리 도구
  /^copy-/, // 복사 도구
  /^css-/, // CSS 도구들
  /^dotenv$/, // 환경변수 (보안상 제외)
  /^file-loader/, // 파일 로더
  /^html-webpack/, // HTML 웹팩
  /^mini-css/, // CSS 추출
  /^style-loader/, // 스타일 로더
  /^terser/, // 압축 도구
  /^rimraf/, // 파일 삭제 도구
  /^concurrently/, // 스크립트 실행 도구
  /^husky/, // Git hooks
  /^license-checker/, // 라이센스 체커 자체
];

/**
 * 패키지가 제외 패턴에 해당하는지 확인
 */
function shouldExcludePackage(packageName) {
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(packageName));
}

/**
 * Extract npm package licenses (직접 의존성만 + 필터링)
 */
function extractNpmLicenses() {
  console.log('📦 Extracting npm package licenses...');

  try {
    // package.json에서 직접 의존성 목록 가져오기
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const directDeps = Object.keys(packageJson.dependencies || {});

    console.log(`   Found ${directDeps.length} direct dependencies in package.json`);

    // license-checker로 모든 패키지 정보 가져오기
    const output = execSync('npx license-checker --json --production', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });

    const allLicenses = JSON.parse(output);
    const formatted = [];
    let excludedCount = 0;

    for (const [packageName, info] of Object.entries(allLicenses)) {
      // Extract package name without version
      const name = packageName.split('@').slice(0, -1).join('@') || packageName;

      // 직접 의존성인지 확인
      if (!directDeps.includes(name)) {
        continue; // 간접 의존성은 제외
      }

      // 제외 패턴에 해당하는지 확인
      if (shouldExcludePackage(name)) {
        excludedCount++;
        continue;
      }

      // Skip packages without clear license info
      if (!info.licenses || info.licenses === 'UNKNOWN') {
        console.warn(`   ⚠️  Skipping ${name}: unknown license`);
        continue;
      }

      formatted.push({
        name: name,
        author: info.publisher || 'Unknown',
        license: info.licenses,
        link: info.repository || info.licenseFile || '',
        category: 'npm',
      });
    }

    console.log(`   ✅ Included ${formatted.length} packages`);
    console.log(`   🚫 Excluded ${excludedCount} build/dev tools`);
    console.log(`   ⏭️  Skipped ${directDeps.length - formatted.length - excludedCount} indirect dependencies`);

    return formatted;
  } catch (error) {
    console.error('❌ Error extracting npm licenses:', error.message);
    return [];
  }
}

/**
 * Detect Google Fonts used in the codebase
 */
function detectGoogleFonts() {
  console.log('🔍 Detecting Google Fonts from codebase...');

  const fontsFound = new Set();

  // Search for font family patterns in TypeScript/JavaScript/CSS files
  const searchPatterns = [
    /fontFamily:\s*['"]([^'"]+)['"]/g,
    /font-family:\s*['"]?([^'";\n]+)['"]?/g,
    /family=([^&:'"]+)/g, // Google Fonts URL parameter
  ];

  function searchFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of searchPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const fontName = match[1].trim().split(',')[0].replace(/['"]/g, '').trim();
        if (
          fontName &&
          !fontName.includes('sans-serif') &&
          !fontName.includes('serif') &&
          !fontName.includes('monospace')
        ) {
          fontsFound.add(fontName);
        }
      }
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
          walkDir(filePath);
        }
      } else if (/\.(ts|tsx|js|jsx|css|scss)$/.test(file)) {
        searchFile(filePath);
      }
    }
  }

  walkDir(path.join(ROOT_DIR, 'src'));

  console.log(`   ✅ Found ${fontsFound.size} unique fonts in codebase`);
  return Array.from(fontsFound);
}

/**
 * Parse README.md fonts section
 */
function parseReadmeFonts() {
  console.log('📖 Parsing README.md fonts section...');

  if (!fs.existsSync(README_PATH)) {
    console.warn('⚠️  README.md not found');
    return [];
  }

  const content = fs.readFileSync(README_PATH, 'utf8');
  const fonts = [];

  // Find the ### fonts section
  const fontsSection = content.match(/### fonts\n\n([\s\S]*?)(?=\n##|$)/);

  if (!fontsSection) {
    console.warn('⚠️  No ### fonts section found in README.md');
    return [];
  }

  const lines = fontsSection[1].split('\n');

  for (const line of lines) {
    // Parse format: - FontName by Author (License, URL)
    const match = line.match(/^-\s*(.+?)\s+by\s+(.+?)\s+\((.+?),\s*(https?:\/\/.+?)\)/);

    if (match) {
      const [, name, author, license, link] = match;
      fonts.push({
        name: name.trim(),
        author: author.trim(),
        license: license.trim(),
        link: link.trim(),
        category: 'font',
      });
    }
  }

  console.log(`   ✅ Parsed ${fonts.length} fonts from README.md`);
  return fonts;
}

/**
 * Generate TypeScript file with all license data
 */
function generateLicenseFile(npmLicenses, fonts) {
  console.log('\n📝 Generating TypeScript license file...');

  const allLicenses = [...npmLicenses, ...fonts];

  const tsContent = `/**
 * Auto-generated license information
 * Generated on: ${new Date().toISOString()}
 *
 * DO NOT EDIT THIS FILE MANUALLY
 * Run: npm run generate-licenses
 *
 * This file contains:
 * - Direct npm dependencies (excluding build/dev tools)
 * - Google Fonts used in the project
 */

export interface LicenseInfo {
  name: string;
  author: string;
  license: string;
  link: string;
  category: 'npm' | 'font' | 'manual';
}

export const NPM_LICENSES: LicenseInfo[] = ${JSON.stringify(npmLicenses, null, 2)};

export const FONT_LICENSES: LicenseInfo[] = ${JSON.stringify(fonts, null, 2)};

export const ALL_LICENSES: LicenseInfo[] = ${JSON.stringify(allLicenses, null, 2)};
`;

  // Ensure directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, tsContent, 'utf8');
  console.log(`   ✅ Generated: ${OUTPUT_PATH}`);
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting license generation...\n');

  const npmLicenses = extractNpmLicenses();
  const detectedFonts = detectGoogleFonts();
  const readmeFonts = parseReadmeFonts();

  // Validate that detected fonts are documented in README
  console.log('\n🔍 Validating font documentation...');
  const documentedFontNames = new Set(readmeFonts.map((f) => f.name));
  const undocumentedFonts = detectedFonts.filter((font) => {
    // 시스템 폰트는 무시
    const systemFonts = ['-apple-system', 'Segoe UI', 'Arial', 'Helvetica', 'Courier New', 'Arial Black'];
    if (systemFonts.includes(font) || font.includes('$')) return false;

    return !Array.from(documentedFontNames).some((docFont) => docFont.includes(font) || font.includes(docFont));
  });

  if (undocumentedFonts.length > 0) {
    console.warn('   ⚠️  Warning: Found fonts in code that are not documented in README.md:');
    undocumentedFonts.forEach((font) => console.warn(`      - ${font}`));
  } else {
    console.log('   ✅ All detected fonts are documented in README.md');
  }

  generateLicenseFile(npmLicenses, readmeFonts);

  console.log('\n✨ License generation complete!');
  console.log(`   Total licenses: ${npmLicenses.length + readmeFonts.length}`);
  console.log(`   - NPM packages: ${npmLicenses.length}`);
  console.log(`   - Fonts: ${readmeFonts.length}`);
}

main();
