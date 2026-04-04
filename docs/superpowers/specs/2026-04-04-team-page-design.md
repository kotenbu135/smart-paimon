# Team画面 デザインスペック

**Date:** 2026-04-04
**Status:** Approved
**Phase:** 2 (Team Composition)

## Overview

smart-paimonのTeam画面。4名のチーム編成を組み、`resolve_team_stats` WASMコールでバフを解決し、ソロ vs チーム編成後のダメージを比較する。CharacterDetail画面と統一感のある左右2カラムレイアウトを採用する。

## Route

`/team` — React Router (HashRouter)

## Layout

### 2カラム構成

CharacterDetail画面と同じパターンの左右分割レイアウト。

- **左サイドバー** (~200px, flex-shrink:0): チーム管理（保存/読み込み、スロット4つ、敵設定）
- **右メインパネル** (flex:1): ダメージサマリー（常時表示）+ 2タブ（バフ詳細 / ダメージテーブル）

```
┌─────────────────────────────────────────────────┐
│ Navbar (Team active)                            │
├────────┬────────────────────────────────────────┤
│ Save/  │ Damage Summary (always visible)        │
│ Load   │  [Chart] [Key Numbers]                 │
│────────│────────────────────────────────────────│
│ Slot 1 │ [Tab: バフ詳細] [Tab: ダメージテーブル]  │
│ (DPS)  │                                        │
│ Slot 2 │  Tab Content Area                      │
│ Slot 3 │  - Buff cards per teammate             │
│ [+ 4]  │  - Or damage table with Before/After   │
│────────│                                        │
│ Enemy  │                                        │
│ Config │                                        │
└────────┴────────────────────────────────────────┘
```

## Left Sidebar

### チーム保存/読み込み（上部）

- テキスト入力: チーム名（例: 「胡桃蒸発パーティ」）
- 「保存」ボタン: 現在のチーム構成をlocalStorageに保存
- 「読み込み ▾」ボタン: Radix Select ドロップダウンで保存済みチーム一覧を表示、選択で読み込み
- 保存データ構造: `{ name: string, members: (string | null)[], mainDpsIndex: number, enemyConfig: Enemy }`
- localStorage key: `smart-paimon-teams`

### チームスロット（4つ、縦並び）

各スロットはカード形式で以下の情報を表示:

**配置済みスロット:**
- キャラアイコン（元素カラーのグラデーション背景、円形）
- キャラ名
- `Lv.{level} C{constellation} | {weapon_name} R{refinement}`
- メインDPSスロットのみ: 「DPS」バッジ（左上）+ 元素カラーボーダー + glow shadow
- 「✕」ボタン（右上）: キャラ削除
- `cursor: grab` — ドラッグで並び替え可能

**空スロット:**
- 破線ボーダー (`border: 2px dashed`)
- 「+」アイコン + 「クリックして追加」テキスト
- ホバーで `borderColor` が gold に変化

**メインDPS指定:**
- スロットカードをクリック（長押し or ダブルクリック）でメインDPSトグル
- メインDPS = ダメージサマリー・ダメージテーブルの対象キャラ
- 初期値: 最初に配置したキャラ

### 敵設定（下部、margin-top: auto）

CharacterDetail画面の `EnemyConfig` コンポーネントをコンパクト化して再利用:
- Level (数値入力)
- Resistance % (数値入力)
- DEF Reduction % (数値入力)
- Reaction (Radix Select ドロップダウン)

2×2グリッドのコンパクトレイアウト。

## Right Main Panel

### ダメージサマリー（常時表示、上部固定）

メインDPSの主要天賦のBefore/After比較を常に表示する。

**左側: 棒グラフ**
- 天賦カテゴリごと（通常攻撃、元素スキル、元素爆発）にSolo/Teamの棒グラフを並べる
- Solo: グレー (`#4b5563`)、Team: グリーン (`#22c55e`)
- 凡例: 「■ Solo ■ Team」

**右側: キーナンバー**
- 各天賦カテゴリの Average ダメージ値
- Team値を太字で表示、差分%を緑色で併記
- 例: `78,500 +145%`

### 2タブ（Radix Tabs）

既存の CharacterDetail 画面と同じ Radix UI Tabs パターンを使用。

#### Tab 1: バフ詳細

**キャラ別バフカード:**

チームメンバーごとに1枚のカードを表示（メインDPS自身は除外）。

カード構成:
- ヘッダー: キャラアイコン（小、元素カラー背景）+ キャラ名 + 元素/武器/命ノ星座
- バフリスト: 各バフ行に以下を表示
  - バフ名と効果値（例: 「Hydro共鳴: HP +25%」）
  - 条件（例: 「Hydroキャラ2名以上」）
  - 持続時間（例: 「常時」「持続4秒」）
  - 効果値を右端に緑色で表示
- バフ行の背景: `#111827`、角丸、パディング付き

**バフ合計サマリー:**

カード群の下に、メインDPSが受けるバフの合計を表示:
- gold ボーダーのカード
- 3カラムグリッドで主要バフ合計値（HP%, ATK%, 耐性減少 等）
- 値は緑色太字

#### Tab 2: ダメージテーブル

CharacterDetail画面の `DamageTable` コンポーネントを拡張し、Before/After列を追加。

テーブル列:
| 天賦名 | 倍率 | Solo Non-crit | Solo Crit | Solo Avg | Team Non-crit | Team Crit | Team Avg | 差分% |

- 差分%: 緑 (`#22c55e`) = 向上、赤 (`#ef4444`) = 低下
- AnimatedNumber コンポーネントで数値をアニメーション表示
- 天賦カテゴリごとにRadix Tabs（Normal / Skill / Burst）でグループ化 — CharacterDetail画面と同じパターン

## Character Selection Modal

空スロットクリック時に開く Radix Dialog。

### モーダル構成

- **ヘッダー:** 「キャラクター選択」+ 閉じるボタン
- **フィルタバー:** 元素フィルタ（7元素トグルチップ）。CharactersPage の `CharacterFilter` の簡易版
- **キャラグリッド:** 5列グリッド、各セルにキャラアイコン + 名前
  - 既にチームに配置済みのキャラ: `opacity: 0.3` + 「✓」マーク
  - 選択中のキャラ: gold ボーダー
- **選択ボタン:** 右下に「選択」ボタン（gold背景）

### フィルタロジック

- インポート済み `CharacterBuild[]` からのみ選択可能
- 元素フィルタで絞り込み（複数選択可、全解除=全表示）
- 既にチームに配置済みのキャラは選択不可（グレーアウト）

## Drag & Drop

スロット間の並び替えに使用。ライブラリは `@dnd-kit/core` + `@dnd-kit/sortable` を推奨。

### 操作

- スロットカードをドラッグして別スロット位置にドロップ → 位置入れ替え
- ドラッグ中: 半透明 + 影 + ドロップ先ハイライト
- Framer Motion の `layoutId` でスムーズなアニメーション

### 制約

- 空スロットへのドラッグは不可（空スロットはクリックでモーダルを開く）
- ドラッグ対象は配置済みスロットのみ

## Moonsign Handling

`is_moonsign` はハードコードリストで判定する。

```typescript
const MOONSIGN_CHARACTERS = new Set([
  "ineffa", "flins", "lauma", "nefer", "zibai",
  "columbina", "aino", "jahoda", "illuga"
]);

function isMoonsignCharacter(characterId: string): boolean {
  return MOONSIGN_CHARACTERS.has(characterId);
}
```

ムーンサインキャラがチームにいる場合、スロットカードに小さなムーンサインアイコン/バッジを表示。

## Zustand Store: TeamStore

```typescript
interface SavedTeam {
  name: string;
  members: (string | null)[];
  mainDpsIndex: number;
  enemyConfig: Enemy;
}

interface TeamState {
  members: (string | null)[];      // 4-slot array of character IDs
  mainDpsIndex: number;            // Index of the main DPS
  enemyConfig: Enemy;              // { level, resistance, def_reduction }
  selectedReaction: Reaction | null;
  resolvedStats: Stats | null;     // Main DPS's resolved stats after team buff resolution
  soloResults: Record<string, DamageResult[]>;  // Solo damage (no team buffs)
  teamResults: Record<string, DamageResult[]>;  // Team damage (with buffs)
  buffBreakdown: BuffBreakdown[];  // Per-teammate buff details
  savedTeams: SavedTeam[];         // localStorage persisted
  isResolving: boolean;            // Loading state for resolveTeam()
  resolveError: string | null;     // Error state for resolveTeam()

  // Actions
  setMember: (index: number, characterId: string | null) => void;
  swapMembers: (fromIndex: number, toIndex: number) => void;
  setMainDps: (index: number) => void;
  setEnemy: (config: Enemy) => void;
  setReaction: (reaction: Reaction | null) => void;
  resolveTeam: () => Promise<void>;   // calls resolve_team_stats WASM
  saveTeam: (name: string) => void;
  loadTeam: (index: number) => void;
  deleteTeam: (index: number) => void;
}

interface BuffBreakdown {
  sourceCharacterId: string;
  sourceCharacterName: string;
  sourceElement: Element;
  buffs: {
    name: string;
    stat: BuffableStat;
    value: number;
    target: BuffTarget;
    // condition and duration are provisional — data source TBD.
    // If WASM provides a buff metadata API, populate from there.
    // Otherwise, maintain a TS-side mapping keyed by (characterId, stat).
    condition?: string;     // e.g. "Hydroキャラ2名以上" (provisional)
    duration?: string;      // e.g. "常時", "持続4秒" (provisional)
  }[];
}
```

### State Flow

1. ユーザーがスロットにキャラを配置 (`setMember`)
2. 2名以上配置されたら自動で `resolveTeam()` を呼び出し
3. `resolveTeam()` の処理:
   a. 各メンバーの `TeamMember` を組み立て（element, weapon_type, stats, buffs_provided, is_moonsign）
   b. WASM `resolve_team_stats(members)` を呼び出し
   c. メインDPSのソロダメージとチームダメージを並行計算
   d. `buffBreakdown` を組み立て
   e. ステート更新 → UI再レンダリング

## File Structure (New/Modified)

```
src/
├── stores/
│   └── team.ts                    # NEW: TeamStore
├── components/
│   └── team/
│       ├── TeamSidebar.tsx        # NEW: Left sidebar (slots + save/load + enemy)
│       ├── TeamSlot.tsx           # NEW: Individual slot card
│       ├── TeamSlotEmpty.tsx      # NEW: Empty slot (+ button)
│       ├── CharacterSelectModal.tsx # NEW: Character selection modal
│       ├── DamageSummary.tsx      # NEW: Always-visible summary (chart + numbers)
│       ├── BuffDetailTab.tsx      # NEW: Buff detail tab content
│       ├── BuffCard.tsx           # NEW: Per-teammate buff card
│       ├── BuffSummary.tsx        # NEW: Aggregated buff summary
│       ├── TeamDamageTable.tsx    # NEW: Before/After damage table
│       └── TeamSaveLoad.tsx       # NEW: Save/load controls
├── pages/
│   └── TeamPage.tsx               # NEW: Page component
└── utils/
    └── moonsign.ts                # NEW: Moonsign character lookup
```

## Animation

既存パターンを踏襲:
- `PageTransition`: ページ遷移時の fade + y-translate
- カードの `whileTap` / `whileHover` アニメーション
- `AnimatedNumber`: ダメージ値の数値アニメーション
- D&D: `@dnd-kit` の `DragOverlay` + Framer Motion `layoutId`
- タブ切替: Framer Motion の `AnimatePresence` でフェードイン

## i18n Keys (New)

**Japanese (ja.json):**
```json
{
  "team": {
    "title": "チーム編成",
    "save": "保存",
    "load": "読み込み",
    "teamName": "チーム名",
    "addCharacter": "クリックして追加",
    "mainDps": "メインDPS",
    "selectCharacter": "キャラクター選択",
    "select": "選択",
    "alreadyInTeam": "配置済み",
    "damageSummary": "ダメージサマリー",
    "buffDetail": "バフ詳細",
    "damageTable": "ダメージテーブル",
    "solo": "Solo",
    "withTeam": "Team",
    "diff": "差分",
    "buffTotal": "バフ合計",
    "condition": "条件",
    "duration": "持続時間",
    "always": "常時",
    "noTeamMembers": "キャラクターを追加してチームを編成してください",
    "savedTeams": "保存済みチーム",
    "noSavedTeams": "保存済みチームはありません",
    "deleteTeam": "削除",
    "moonsign": "ムーンサイン",
    "enemyConfig": "敵設定",
    "resolving": "チームステータスを計算中...",
    "resolveError": "チーム計算に失敗しました"
  }
}
```

**English (en.json):**
```json
{
  "team": {
    "title": "Team Composition",
    "save": "Save",
    "load": "Load",
    "teamName": "Team Name",
    "addCharacter": "Click to add",
    "mainDps": "Main DPS",
    "selectCharacter": "Select Character",
    "select": "Select",
    "alreadyInTeam": "In team",
    "damageSummary": "Damage Summary",
    "buffDetail": "Buff Details",
    "damageTable": "Damage Table",
    "solo": "Solo",
    "withTeam": "Team",
    "diff": "Diff",
    "buffTotal": "Total Buffs",
    "condition": "Condition",
    "duration": "Duration",
    "always": "Permanent",
    "noTeamMembers": "Add characters to build your team",
    "savedTeams": "Saved Teams",
    "noSavedTeams": "No saved teams",
    "deleteTeam": "Delete",
    "moonsign": "Moonsign",
    "enemyConfig": "Enemy Config",
    "resolving": "Resolving team stats...",
    "resolveError": "Team calculation failed"
  }
}
```

## Dependencies (New)

- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` — ドラッグ&ドロップ

## Open Questions (Phase 2 Spec Dependent)

1. **`buffs_provided` の組み立てロジック**: キャラパッシブ天賦、命ノ星座効果、武器パッシブから `ResolvedBuff[]` をどう構築するか。WASM側に `get_character_buffs(id, constellation, weapon_id, refinement)` のようなAPIがあるか、TS側でハードコードするか。
2. **元素共鳴の処理**: チーム内の元素構成から自動判定するか、`resolve_team_stats` が内部で処理するか。
3. **`BuffBreakdown` の条件/持続時間データソース**: WASM側から取得可能か、TS側でマッピングが必要か。
