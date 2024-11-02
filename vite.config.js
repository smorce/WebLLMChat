import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 依存関係の最適化設定
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@huggingface/transformers']
  },
  // ビルド設定
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    // WebGPU対応のため、最新のJavaScript機能をサポート
    target: 'esnext'
  },
  // 開発サーバー設定
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true,
    // CORS設定を追加
    cors: true,
    watch: {
      usePolling: true // Dockerでのホットリロード対応
    },
    hmr: {
      // HMR（ホットモジュールリロード）の設定
      clientPort: 5173,
      host: 'localhost',
      protocol: 'ws'
    }
  }
});