import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4000,          // 固定でポート4000を使用
    strictPort: true,    // ポート4000が使用中の場合はエラーで停止
    host: true,          // ネットワークアクセスを許可
    open: true           // ブラウザを自動で開く
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
}); 