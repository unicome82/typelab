import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages는 /typelab/ 하위 경로에서 열리므로 자산 경로를 상대 경로로 빌드
  base: './',
});
