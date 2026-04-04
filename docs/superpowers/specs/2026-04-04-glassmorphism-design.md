# キャラクター詳細画面 グラスモーフィズム適用

**Date:** 2026-04-04
**Status:** Approved
**Scope:** CharacterDetailPage の全コンポーネントにグラスモーフィズム効果を適用

## 概要

キャラクター詳細画面のカード・テーブル・タブ等すべてのUIコンポーネントにグラスモーフィズム（レベルC: しっかり）を適用し、質感を大幅に向上させる。レイアウト変更は行わない。

## デザイン方針

- **レイアウト**: 現状の2カラム構成を完全に維持
- **質感**: backdrop-filter blur(20px) + 多層シャドウ + insetハイライト + ホバーグロー
- **テーマ**: 既存のnavyダークテーマの延長、元素色はそのまま活用
- **blurの適用原則**: `backdrop-filter` はトップレベルの `glass-card` のみに適用。ネストされた要素（inner, header）は背景色の透明度差のみで奥行きを表現（ネストされたbackdrop-filterはレンダリングが不安定でパフォーマンスも悪い）

## コアスタイル定義

### 共通glassカード (`glass-card`)

唯一 `backdrop-filter` を使用するレイヤー:

```css
background: rgba(37, 42, 64, 0.4);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;  /* 既存の rounded-lg を維持 */
box-shadow:
  0 8px 32px rgba(0,0,0,0.3),
  inset 0 1px 0 rgba(255,255,255,0.06),
  inset 0 -1px 0 rgba(0,0,0,0.1);
```

### 内側glass要素 (`glass-inner`)

アイコン枠やStepperボタンなど、glass-card内の小さな要素向け。blurなし、背景色差のみ:

```css
background: rgba(47, 52, 82, 0.5);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### glassヘッダー (`glass-header`)

ステータスパネルのヘッダー、テーブルのthead向け。blurなし、背景色差のみ:

```css
background: rgba(47, 52, 82, 0.4);
```

### ホバーエフェクト (`glass-row-hover`)

ステータス行・テーブル行のホバー時の視覚効果のみ。既存のpadding/marginは各コンポーネントが維持する:

```css
transition: background 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
border: 1px solid transparent;
border-radius: 6px;

&:hover {
  background: color-mix(in srgb, var(--element-color) 8%, transparent);
  border-color: color-mix(in srgb, var(--element-color) 12%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--element-color) 5%, transparent);
}
```

### 元素色CSS変数の適用

`CharacterDetailPage` のルート要素に `--element-color` をインラインstyleで設定。各コンポーネントはこれを継承する:

```tsx
// CharacterDetailPage.tsx
<div
  className="max-w-[1440px] mx-auto px-6 flex flex-col"
  style={{ '--element-color': getElementColor(build.character.element) } as React.CSSProperties}
>
```

`StatsPanel` は現在 `element` propを受け取っていないが、CSS変数はDOMツリーから継承されるため、追加のprop変更は不要。

## コンポーネント別変更

### 1. CharacterProfile.tsx

**プロフィールセクション:**
- `bg-navy-card border border-navy-border` → `glass-card`
- アバターの `box-shadow` を `0 0 20px rgba(element-color, 0.25)` に強化
- レベルタグに元素色のglass背景

**武器セクション:**
- `bg-navy-card border border-navy-border` → `glass-card`
- 武器アイコン枠を `glass-inner` に変更

**聖遺物セクション:**
- `bg-navy-card border border-navy-border` → `glass-card`
- 各スロットボタンを `glass-inner` スタイルに変更
- 選択時ボーダーを `border-gold/60` からelement色グローに

### 2. StatsPanel.tsx

- 外枠: `bg-navy-card border border-navy-border` → `glass-card`
- ヘッダー: `bg-navy-hover/50` → `glass-header`
- 各stat行: `glass-row-hover` 適用（元素色はCSS変数から継承）
- 元素ダメージボーナス行: 対応元素色でホバーグロー

### 3. DamageTable.tsx

- テーブル外枠: `bg-navy-card border border-navy-border` → `glass-card`
- thead: `bg-navy-hover/50` → `glass-header`
- tbody行: `hover:bg-navy-hover/30` → `glass-row-hover`（元素色）
- Charged/Plunging サブセクションヘッダー: `bg-navy-hover/30` → `glass-header`
- タブコンテナ: `bg-navy-border/50` → `glass-inner`
- アクティブタブ: 既存の元素色背景 + 微かなglow追加

### 4. EnemyConfig.tsx

- 外枠: `bg-navy-card border border-navy-border` → `glass-card`
- Stepperの +/- ボタン: `bg-navy-hover` → `glass-inner`
- Stepper入力フィールド: `bg-navy-card` → `background: transparent`

### 5. ArtifactDetailPopover.tsx

- サブスタット領域のボーダー: `border-navy-border/40` → `rgba(255,255,255,0.06)`

### 6. ReactionSelector.tsx

- 外枠: `bg-navy-card border border-navy-border` → `glass-card`
- リアクションボタン: `bg-navy-border` / `bg-navy-hover` → `glass-inner`
- 選択状態: 既存の元素色背景を維持、微かなglow追加

## 実装方針

### CSS変更 (index.css)

新しいユーティリティクラスを追加:
- `.glass-card` — 共通カードスタイル（唯一のbackdrop-filter適用レイヤー）
- `.glass-inner` — 内側要素スタイル（blurなし、背景色差のみ）
- `.glass-header` — ヘッダー背景（blurなし、背景色差のみ）
- `.glass-row-hover` — 行ホバー視覚効果（CSS変数 `--element-color` で色指定、既存のpadding/marginを変更しない）

### 各コンポーネント

既存のTailwindクラス（`bg-navy-card`, `border-navy-border`, `bg-navy-hover`）を新しいglassクラスに差し替える。

### パフォーマンス考慮

- `backdrop-filter` はトップレベルカードのみに限定し、ネストしない
- `transition` は `background`, `border-color`, `box-shadow` のみを対象とし、`all` を避ける
- `@media (prefers-reduced-motion: reduce)` でblurとtransitionをフォールバック

## 変更対象ファイル

1. `src/index.css` — glassユーティリティクラス追加
2. `src/pages/CharacterDetailPage.tsx` — `--element-color` CSS変数設定
3. `src/components/detail/CharacterProfile.tsx` — glass適用
4. `src/components/detail/StatsPanel.tsx` — glass適用
5. `src/components/detail/DamageTable.tsx` — glass適用
6. `src/components/detail/EnemyConfig.tsx` — glass適用
7. `src/components/detail/ArtifactDetailDialog.tsx` — 微調整
8. `src/components/detail/ReactionSelector.tsx` — glass適用

## 非変更

- レイアウト構造（2カラム、コンポーネント配置）
- 各行のpadding/margin（既存値を維持）
- 機能（計算ロジック、状態管理）
- カラーパレット（元素色、gold、テキスト色）
- フォント
- アニメーション（Framer Motion）
