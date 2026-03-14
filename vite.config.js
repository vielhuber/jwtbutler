import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    if (mode === 'dist') {
        return {
            build: {
                outDir: '_dist',
                rollupOptions: {
                    input: './_js/script.js',
                    output: {
                        format: 'iife',
                        entryFileNames: 'jwtbutler.js'
                    }
                },
                sourcemap: false,
                minify: false,
                emptyOutDir: false
            }
        };
    }
    if (mode === 'tests') {
        return {
            build: {
                outDir: '_tests',
                rollupOptions: {
                    input: './_tests/frontend.js',
                    output: {
                        format: 'iife',
                        entryFileNames: 'frontend.min.js'
                    }
                },
                sourcemap: false,
                minify: false,
                emptyOutDir: false
            }
        };
    }
});
