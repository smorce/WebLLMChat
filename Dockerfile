FROM node:20-slim

# GPUサポートに必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    libvulkan1 \
    mesa-vulkan-drivers \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install date-fns uuid

COPY . .

# Viteのデフォルトポートを公開
EXPOSE 5173

# 開発サーバーの起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]