# CNP インベーダー

和風インベーダーゲーム - Cryptoninja Invader

## 概要

CNP インベーダーは和風テイストのインベーダーゲームです。

## 開発者向け情報

### バージョン管理について

このプロジェクトは**自動化されたバージョン管理システム**を採用しています。

#### 📦 バージョン管理の仕組み

**Single Source of Truth**: `package.json`のversionフィールドが唯一の信頼できるバージョン情報源です。

**自動同期対象ファイル**:
- `index.html` - UI表示、ページタイトル、クレジット
- `src/js/main.js` - ヘッダーコメント
- `src/css/style.css` - ヘッダーコメント  
- `src/js/screens/titleScreen.js` - ヘッダー、バージョン変数、表示
- `src/js/game.js` - ヘッダーコメント
- `src/js/screens/gameScreen.js` - ヘッダーコメント

#### 🚀 バージョン更新コマンド

```bash
# バージョン同期のみ（現在のバージョンで全ファイル統一）
npm run version:sync

# パッチバージョン更新 (0.1.3 → 0.1.4)
npm run version:update

# マイナーバージョン更新 (0.1.3 → 0.2.0)
npm run version:minor

# メジャーバージョン更新 (0.1.3 → 1.0.0)
npm run version:major
```

#### ⚠️ 重要な注意事項

- **手動でのバージョン変更は推奨されません**
- バージョン変更時は上記のnpmスクリプトを使用してください
- これにより全ファイルのバージョン表記が自動的に統一されます

## 起動方法

```
npm run dev
```

または特定のポートで起動する場合：

```
npx vite --port 4000
```

## ライセンス

MIT
