#!/bin/bash

# 初回実行は実行権限をつける
# chmod +x start_webllmchat.sh

# プロジェクト名を小文字に
PROJECT_NAME="webllmchat"

# docker compose.ymlファイルのパスを設定
COMPOSE_FILE="compose.yaml"

# Dockerfileのハッシュを計算
DOCKERFILE="Dockerfile"
if [ -f "$DOCKERFILE" ]; then
    dockerfile_hash=$(md5sum $DOCKERFILE | awk '{print $1}')
else
    echo "Dockerfileが見つかりません"
    exit 1
fi

# イメージ名を設定
IMAGE_NAME="${PROJECT_NAME}-image"

# 古いコンテナとイメージを削除
echo "古いコンテナとイメージを削除中..."
docker compose down
docker rmi $IMAGE_NAME:latest 2>/dev/null

# 新規ビルドと起動
echo "新規ビルドを開始します..."
docker compose build

# コンテナの起動
echo "コンテナを起動します..."
docker compose up -d

# ログの表示
echo "コンテナが起動しました。ログを表示します："
docker compose logs -f