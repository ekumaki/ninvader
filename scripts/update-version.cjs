#!/usr/bin/env node

/**
 * CNP インベーダー - バージョン統一スクリプト
 * package.jsonのバージョンを基準として全ファイルのバージョン表記を統一する
 */

const fs = require('fs');
const path = require('path');

// カラー出力用のコンソール関数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// package.jsonからバージョンを読み取り
function getVersionFromPackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.error(colors.red('❌ package.jsonの読み取りに失敗しました:'), error.message);
    process.exit(1);
  }
}

// ファイルの内容を読み取り
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(colors.red(`❌ ファイル読み取りエラー: ${filePath}`), error.message);
    return null;
  }
}

// ファイルに内容を書き込み
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(colors.red(`❌ ファイル書き込みエラー: ${filePath}`), error.message);
    return false;
  }
}

// バージョン更新の設定
const updateConfigs = [
  {
    file: 'index.html',
    updates: [
      {
        pattern: /<div class="version-info">Version [\d.]+<\/div>/,
        replacement: (version) => `<div class="version-info">Version ${version}</div>`,
        description: 'UI バージョン表示'
      },
      {
        pattern: /alert\('CNP インベーダー\\nVersion [\d.]+\\n© 2025 All Rights Reserved'\)/,
        replacement: (version) => `alert('CNP インベーダー\\nVersion ${version}\\n© 2025 All Rights Reserved')`,
        description: 'クレジット アラート'
      },
      {
        pattern: /<title>CNP インベーダー v[\d.]+<\/title>/,
        replacement: (version) => `<title>CNP インベーダー v${version}</title>`,
        description: 'ページタイトル'
      }
    ]
  },
  {
    file: 'src/js/main.js',
    updates: [
      {
        pattern: / \* Version: [\d.]+/,
        replacement: (version) => ` * Version: ${version}`,
        description: 'ヘッダーコメント'
      }
    ]
  },
  {
    file: 'src/css/style.css',
    updates: [
      {
        pattern: / \* Version: [\d.]+/,
        replacement: (version) => ` * Version: ${version}`,
        description: 'ヘッダーコメント'
      }
    ]
  },
  {
    file: 'src/js/screens/titleScreen.js',
    updates: [
      {
        pattern: / \* Version: [\d.]+/,
        replacement: (version) => ` * Version: ${version}`,
        description: 'ヘッダーコメント'
      },
      {
        pattern: /const version = '[\d.]+'/,
        replacement: (version) => `const version = '${version}'`,
        description: 'バージョン変数'
      },
      {
        pattern: /version\.textContent = 'v[\d.]+'/,
        replacement: (version) => `version.textContent = 'v${version}'`,
        description: 'バージョン表示'
      },
      {
        pattern: /alert\('CNP インベーダー\\nVersion [\d.]+\\n 2025 All Rights Reserved'\)/,
        replacement: (version) => `alert('CNP インベーダー\\nVersion ${version}\\n 2025 All Rights Reserved')`,
        description: 'クレジット アラート'
      }
    ]
  },
  {
    file: 'src/js/game.js',
    updates: [
      {
        pattern: / \* Version: [\d.]+/,
        replacement: (version) => ` * Version: ${version}`,
        description: 'ヘッダーコメント'
      }
    ]
  },
  {
    file: 'src/js/screens/gameScreen.js',
    updates: [
      {
        pattern: / \* Version: [\d.]+/,
        replacement: (version) => ` * Version: ${version}`,
        description: 'ヘッダーコメント'
      }
    ]
  }
];

// ファイル更新処理
function updateFileVersion(config, version) {
  const filePath = path.join(__dirname, '..', config.file);
  
  console.log(colors.blue(`📄 ${config.file} を処理中...`));
  
  let content = readFile(filePath);
  if (!content) {
    return false;
  }
  
  let updated = false;
  let updatedCount = 0;
  
  config.updates.forEach(update => {
    const matches = content.match(update.pattern);
    if (matches) {
      const newContent = content.replace(update.pattern, update.replacement(version));
      if (newContent !== content) {
        content = newContent;
        updated = true;
        updatedCount++;
        console.log(colors.green(`  ✅ ${update.description}: 更新しました`));
      } else {
        console.log(colors.yellow(`  ⚠️  ${update.description}: 既に最新です`));
      }
    } else {
      console.log(colors.red(`  ❌ ${update.description}: パターンが見つかりません`));
    }
  });
  
  if (updated) {
    const success = writeFile(filePath, content);
    if (success) {
      console.log(colors.green(`  💾 ${config.file}: ${updatedCount}箇所を更新しました\n`));
      return true;
    } else {
      return false;
    }
  } else {
    console.log(colors.cyan(`  📝 ${config.file}: 更新不要です\n`));
    return true;
  }
}

// メイン処理
function main() {
  console.log(colors.cyan('🚀 CNP インベーダー バージョン統一スクリプト開始\n'));
  
  // 現在のバージョンを取得
  const version = getVersionFromPackageJson();
  console.log(colors.green(`📦 package.json のバージョン: ${version}\n`));
  
  let totalUpdated = 0;
  let successCount = 0;
  
  // 各ファイルを処理
  updateConfigs.forEach(config => {
    const success = updateFileVersion(config, version);
    if (success) {
      successCount++;
    }
    totalUpdated++;
  });
  
  // 結果の表示
  console.log(colors.cyan('📊 処理結果:'));
  console.log(colors.green(`✅ 成功: ${successCount}/${totalUpdated} ファイル`));
  
  if (successCount === totalUpdated) {
    console.log(colors.green('\n🎉 すべてのファイルのバージョンが統一されました！'));
    process.exit(0);
  } else {
    console.log(colors.red(`\n❌ ${totalUpdated - successCount} ファイルの処理に失敗しました`));
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { getVersionFromPackageJson, updateFileVersion }; 