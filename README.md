# polymarket_indexer

複数のサブグラフ (activity, fpmm, oi, orderbook, pnl) から Apollo Client を使ってデータを取得する Node.js (TypeScript) アプリケーションです。コマンドライン引数で、どのサブグラフのデータを取得するか・タイムスタンプの範囲を指定できます。

#Problem
- データ取得の進捗がわからないものがある
   - 進捗バーの表示を統一した関数で管理したい
- 時刻指定してもデータ取得のフィルターがかからないものがある
   - それぞれのindexが何を表しているのかが分かれば対応できる   
- fpmm のデータ取得がうまくいかない

## Directory Structure

```
polymarket_indexer/
├── package.json
├── tsconfig.json
├── .gitignore
├── Dockerfile               # Docker で動かす場合に使用 (任意)
└── src/
    ├── config/
    │   └── apolloClient.ts  # Apollo Client の初期化
    ├── graphql/
    │   ├── activity/
    │   │   ├── queries.ts
    │   │   └── schema.graphql
    │   ├── fpmm/
    │   │   ├── queries.ts
    │   │   └── schema.graphql
    │   ├── oi/
    │   │   ├── queries.ts
    │   │   └── schema.graphql
    │   ├── orderbook/
    │   │   ├── queries.ts
    │   │   └── schema.graphql
    │   ├── pnl/
    │   │   ├── queries.ts
    │   │   └── schema.graphql
    ├── services/
    │   ├── activity.ts
    │   ├── fpmm.ts
    │   ├── oi.ts
    │   ├── orderbook.ts
    │   ├── pnl.ts
    │   └── index.ts         # まとめエクスポート
    ├── path.ts              # サブグラフのエンドポイント URL を設定
    └── index.ts             # エントリーポイント (CLI 引数解析と実行)
```

## Setup

1. **Clone the repository**

   ```bash
   git clone <リポジトリURL> polymarket_indexer
   cd polymarket_indexer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **`path.ts` ファイルの作成**

   `path.ts` に、以下のように各サブグラフのエンドポイント URL を設定してください。

   - 2024/12/25 現在、デフォルトのサブグラフは以下の通りです。
     - src:https://docs.polymarket.com/

   ```ts
   export const ORDERS_PATH =
   	"https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/polymarket-orderbook-resync/prod/gn";
   export const POSITIONS_PATH =
   	"https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/positions-subgraph/0.0.7/gn";
   export const ACTIVITY_PATH =
   	"https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/activity-subgraph/0.0.4/gn";
   export const OPEN_INTEREST_PATH =
   	"https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/oi-subgraph/0.0.6/gn";
   export const PNL_PATH =
   	"https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/pnl-subgraph/0.0.14/gn";
   ```

4. **TypeScript のビルド**

   ```bash
   npm run build
   ```

   これにより `dist/` ディレクトリ内にトランスパイル済みの JavaScript ファイルが生成されます。

## 使い方

### 1. ローカル環境で実行

```bash
node dist/index.js --schema=<サブグラフ名> --fromTime=<開始UNIX秒> --toTime=<終了UNIX秒>
```

- **サブグラフ名** (schema) は `activity`, `fpmm`, `oi`, `orderbook`, `pnl`, または `all` を指定可能
  - `--schema=activity` の場合、activity サブグラフだけを取得
  - `--schema=all` の場合、すべてのサブグラフを順番に取得
- **タイムスタンプ範囲** (`--fromTime`, `--toTime`) は省略可能
  - 省略した場合、デフォルトで `fromTime = 0`、`toTime = (現在時刻)` が使われる
  - **timestamp を持たないエンティティ**はフィルタなしで全件取得

実行例:

```bash
# 例1: activity サブグラフだけを、1660000000〜1669999999 の期間で取得
node dist/index.js --schema=activity --fromTime=1660000000 --toTime=1669999999

# 例2: 全サブグラフを取得 (タイムスタンプ指定なし)
node dist/index.js --schema=all
```

実行結果として、コンソールに各エンティティの取得件数が出力されます。  
（本番ではファイルに保存したり、データベースに書き込んだりするなど拡張可能です。）

## 主な機能

1. **複数サブグラフの対応**

   - `activity`, `fpmm`, `oi`, `orderbook`, `pnl` の 5 つを CLI で選択
   - `all` を選ぶとすべて一括で取得

2. **timestamp フィルタリング**

   - `--fromTime`, `--toTime` で指定した範囲に該当するエンティティを取得
   - timestamp がないエンティティは全件取得

3. **ページネーション**

   - `first`, `skip` を使い、ループですべてのデータを取得（1 回に取得する上限は 1000 件が基本）
   - 取得完了までループし、全件をまとめて返す

4. **TypeScript + Apollo Client**
   - The Graph 上のデータを効率よく取得し、型定義を整えやすい
