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

## Git ブランチ運用ルール

公開用ブランチと開発ブランチを切り分け、安心してリリースと開発を並行できるようにしています。

| ブランチ | 役割 |
|---------|------|
| `main` (旧 `master`) | 公開・リリース専用。常に動作する安定版のみを配置し、GitHub Pages や Release ZIP はこのブランチから生成します。 |
| `develop` | 日常的な開発を集約するブランチ。`feature/*` などの作業ブランチはここへマージします。 |
| `feature/*` | 新機能や改善ごとの短命ブランチ。作業が完了したら PR で `develop` へマージします。 |
| `hotfix/*` | リリース後に見つかった緊急バグ修正用。`main` をベースに修正し、`main` と `develop` の両方へ取り込んで整合性を保ちます。 |

### 基本フロー

```text
          ┌─────────────┐        ┌───────────────┐
          │ feature/xyz │ …PR→ │ develop       │
          └─────────────┘        │               │
                                   │ (十分安定したら)
                                   ▼
                                ┌────────┐
                                │ main   │──► GitHub Release / Pages
                                └────────┘
```

1. `feature/*` で実装 → PR → `develop` にマージ
2. リリース時に `develop` → `main` へ PR し、タグ (例: `v0.2.14`) を打つ
3. 緊急修正は `hotfix/*` → `main` へマージ後、同じ修正を `develop` にも反映

### ブランチ作成コマンド例

```bash
# develop から機能ブランチを切る
git checkout develop
git pull
git checkout -b feature/awesome-ui

# 作業後コミットしてプッシュ
git push -u origin feature/awesome-ui

# PR → develop へマージ
```

### リリース手順例 (パッチ)

```bash
# main に切替 & 最新取得
git checkout main
git pull

# develop を取り込み (Fast-Forward 推奨)
git merge --no-ff develop

# バージョンアップしてヘッダー同期
echo "更新内容をCHANGELOGへ追加..."
npm version patch -m "chore(release): v%s"
npm run version:sync

# プッシュ & タグ公開
git push origin main --follow-tags
```

これらの手順により「公開コードは常に main」「開発は自由に develop/feature」で安心運用できます。

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

## デバッグ用機能

`src/js/config/gameConfig.js` の `DEBUG` オブジェクトで、開発時に便利なデバッグ機能を制御できます。

| フラグ名         | 概要                                      |
|------------------|-------------------------------------------|
| `GOD_MODE`       | trueでプレイヤーがダメージを受けなくなります（無敵モード）。|
| `SHOW_INFO`      | trueで敵の数や弾数などのデバッグ情報が画面に表示されます。|

**使い方例：**
```js
DEBUG: {
  GOD_MODE: true,      // ← 無敵化
  SHOW_INFO: true      // ← デバッグ情報表示
},
```

本番リリース時は両方とも `false` にしてください。
