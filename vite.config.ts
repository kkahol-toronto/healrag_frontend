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
        // Disable source maps for production to reduce file count
        sourcemap: false,
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: id => {
                    if (id.includes("@fluentui/react-icons")) {
                        return "fluentui-icons";
                    } else if (id.includes("@fluentui/react")) {
                        return "fluentui-react";
                    } else if (id.includes("node_modules")) {
                        return "vendor";
                    }
                }
            }
        },
        target: "esnext",
        // Inline smaller assets to reduce file count
        assetsInlineLimit: 8192,
        // Disable CSS code splitting to reduce file count
        cssCodeSplit: false
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