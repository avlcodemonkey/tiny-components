/// <reference types="vitest" />

import { defineConfig } from 'vite'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            formats: ['es'],
        },
        rollupOptions: {
            external: /^lit/,
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
    resolve: {
        alias: {
            '~chota': resolve(__dirname, 'node_modules/chota'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
})
