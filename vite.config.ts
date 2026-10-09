import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Rutas relativas para despliegue estático
  server: {
    port: 3000,
    open: true
  },
  // @ts-expect-error vitest options
  test: {
    environment: 'happy-dom'
  }
});
