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
        // No source maps
        sourcemap: false,
        chunkSizeWarningLimit: 5000,
        rollupOptions: {
            output: {
                // Put EVERYTHING into a single JavaScript file
                manualChunks: () => 'app',
                // Minimize asset files
                assetFileNames: 'assets/[name].[ext]',
                chunkFileNames: 'assets/[name].js',
                entryFileNames: 'assets/[name].js'
            }
        },
        target: "esnext",
        // Inline ALL assets under 200KB (very aggressive)
        assetsInlineLimit: 200000,
        // Single CSS file
        cssCodeSplit: false,
        minify: true
    },
    server: {
        port: 3000,
        host: "localhost"
    },
    define: {
        global: 'window'
    }
});