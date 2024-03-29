/// <reference types="vitest" />

import { defineConfig } from 'vite'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'tinyComponents',
            formats: ['es'],
        },
        rollupOptions: {
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
