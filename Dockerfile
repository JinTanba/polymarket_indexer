# Node.jsの公式イメージをベースとして使用
FROM node:18-slim

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# 実行コマンドを設定
ENTRYPOINT ["node", "dist/index.js"]

