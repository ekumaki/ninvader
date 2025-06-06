# CNP インベーダー

和風インベーダーゲーム - Cryptoninja Invader

## 概要

CNP インベーダーは和風テイストのインベーダーゲームです。

## 開発者向け情報

### バージョン管理について

バージョン情報は以下のファイルで管理されています：

1. `package.json` - プロジェクトのメインバージョン情報
2. `src/js/screens/titleScreen.js` - タイトル画面に表示されるバージョン情報

**重要**: バージョン番号を更新する際は、必ず以下の両方のファイルを更新してください：

- `package.json`の`version`フィールド
- `src/js/screens/titleScreen.js`内の以下の2箇所：
  - `render`メソッド内の`const version = '0.1.3'`
  - HTMLのバージョン表示`version.textContent = 'v0.1.3'`

これにより、アプリケーション全体で一貫したバージョン表示が保証されます。

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
