# スコアシステム分析・実装計画

## 現在の状況

### 設定値（更新後の仕様）

#### 基本スコア
- **基本スコアの概念なし**（従来のENEMY_KILL、UFO_KILL、BOSS_KILL、STAGE_CLEARは廃止）

#### 敵別ポイント
- **ザコ敵**: 10点（ステージ1～3共通、敵A・B・C区別なし）

#### 特殊敵ポイント
- **UFO（通常）**: 200点（出現確率90%）
- **UFO（レア）**: 1,000点（出現確率10%）

#### ボス別ポイント
- **弁天**: 500点
- **孤白**: 800点
- **鬼**: 1,000点

#### 廃止項目
- **ステージクリア得点**: 廃止

### 問題点

1. **スコア表示の固定化**
   - UI上のスコア表示が「SCORE: 0」で固定されている
   - 実際のゲームプレイでスコアが変動しない

2. **スコア加算ロジックの未実装**
   - 敵を撃破してもスコアが加算されない
   - ボス撃破時のスコア処理が未実装

3. **ScoreManagerクラスの未実装**
   - スコア管理を行うクラスが存在しない
   - GameScene.tsに「TODO: ScoreManager実装後に追加」が4箇所存在

4. **UFOの通常・レア分類の未実装**
   - 現在は単一のUFOのみ
   - レアUFO用の画像（ufo_bonus_rare.png）が追加済み

## スコア計算シミュレーション

### 1ステージあたりの想定最高スコア

#### 通常敵撃破スコア
- ザコ敵: 10点 × 26体 = 260点
- **小計**: 260点

#### ボス撃破スコア
- 弁天: 500点
- 孤白: 800点
- 鬼: 1,000点
- **小計**: 2,300点

#### ボーナススコア
- UFO撃破: 200点（通常）または 1,000点（レア）
- **小計**: 200～1,000点

#### **1ステージ最高スコア: 3,560点**（レアUFO撃破時）
#### **1ステージ通常スコア: 2,760点**（通常UFO撃破時）

### 全ステージクリア時の想定スコア
- 1ステージ × 複数ステージ（仕様未確認）
- 難易度上昇に応じたスコア倍率の可能性

## 実装すべき機能

### 1. ScoreManagerクラス
```typescript
class ScoreManager {
  private currentScore: number = 0;
  
  // スコア加算
  addScore(points: number): void
  
  // 現在スコア取得
  getCurrentScore(): number
  
  // スコアリセット
  resetScore(): void
  
  // スコア表示更新通知
  private notifyScoreUpdate(): void
}
```

### 2. UFOの通常・レア分類システム
```typescript
class Ufo extends BaseEntity {
  private isRare: boolean;
  private rareChance: number = 0.1; // 10%
  
  constructor(game: GameEngine, x: number, y: number, direction: number = 1) {
    // 通常90%、レア10%の確率で決定
    this.isRare = Math.random() < this.rareChance;
    
    // 画像とポイントを設定
    this.loadImageByType();
    this.setPointsByType();
  }
  
  private loadImageByType(): void {
    const imagePath = this.isRare 
      ? './src/assets/img/enemy/ufo_bonus_rare.png'
      : './src/assets/img/enemy/ufo_bonus.png';
  }
  
  private setPointsByType(): void {
    this.points = this.isRare ? 1000 : 200;
  }
}
```

### 3. ゲームイベントでのスコア加算
- **敵撃破時**: Enemy.tsでの撃破処理にスコア加算（10点）
- **ボス撃破時**: Boss.tsでの撃破処理にスコア加算（500/800/1000点）
- **UFO撃破時**: UFO.tsでの撃破処理にスコア加算（200/1000点）

### 4. UI表示の更新
- **リアルタイム表示**: スコア変動時の即座な表示更新
- **シンプル表示**: 3桁区切りなし、演出なし
- **既存UI活用**: ScoreDisplay.updateScore()を使用

## 実装優先順位

### Phase 1: 基本スコア機能
1. ✅ ブランチ作成（feature/score-system）
2. 🔄 ScoreManagerクラスの実装
3. 🔄 UFOの通常・レア分類機能
4. 🔄 各エンティティでのスコア加算処理
5. 🔄 UI表示の更新

### Phase 2: 統合テスト
1. ゲーム内でのスコア動作確認
2. UFOレア出現確認
3. バグ修正・調整

## 技術的考慮事項

### パフォーマンス
- スコア更新の頻度制限は不要（シンプル表示）
- UI更新の最適化
- メモリリークの防止

### ユーザー体験
- シンプルなスコア表示
- レアUFOの視覚的区別
- スムーズなスコア更新

### 拡張性
- 将来的なハイスコア機能追加の準備
- 設定値の外部化

## 実装仕様

### UFO分類
- **通常UFO**: 90%確率、200点、ufo_bonus.png
- **レアUFO**: 10%確率、1,000点、ufo_bonus_rare.png

### スコア表示
- **リアルタイム更新**: 敵撃破時に即座に更新
- **フォーマット**: 数値のみ、3桁区切りなし
- **演出**: ポップアップ等の演出なし

### ハイスコア機能
- **当面実装しない**: 将来的な拡張に備えた設計のみ

---

*最終更新: 2024年*
*プロジェクト: CNP インベーダー v0.2.13*
*ブランチ: feature/score-system* 