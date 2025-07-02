import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        preserveSymlinks: true
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        // Disable source maps completely
        sourcemap: false,
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                // More aggressive chunking - put everything into fewer files
                manualChunks: {
                    // Single vendor chunk for all node_modules
                    'vendor': ['react', 'react-dom'],
                    // Single fluentui chunk
                    'fluentui': ['@fluentui/react', '@fluentui/react-icons']
                }
            }
        },
        target: "esnext",
        // Inline more assets to reduce file count (increase from 8kb to 32kb)
        assetsInlineLimit: 32768,
        // Disable CSS code splitting completely
        cssCodeSplit: false,
        // Use default minification (esbuild) instead of terser
        minify: true
    },
    server: {
        port: 3000,
        host: "localhost"
    },
    define: {
        // Ensure React is available globally for libraries that expect it
        global: 'window'
    }
});