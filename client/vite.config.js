import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        open: true,
        // Keep Google OAuth "Authorized JavaScript origins" stable during dev.
        // If 5173 is taken, Vite will now error instead of silently switching to 5174+ (which causes origin_mismatch).
        host: 'localhost',
        strictPort: true,
    },
    preview: {
        port: 4173,
        host: true,
    }
});
