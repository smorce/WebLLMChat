FROM node:20-slim

# GPUサポートに必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    libvulkan1 \
    mesa-vulkan-drivers \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係を先にコピーしインストール
COPY package*.json ./
RUN npm install
RUN npm install date-fns uuid

# ソースコードをコピー
COPY . .

# Viteのデフォルトポートを公開
EXPOSE 5173

# 開発サーバーの起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]