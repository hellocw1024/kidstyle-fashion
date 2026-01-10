import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
  },
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || 'AIzaSyDzSffszX2ra3s0WmsVgIlSS3TitpMPCpg'),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://cqjskmeodznouiixdrok.supabase.co'),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_K26cSK7CSEV61FS56ea8mw_eUN7O92F')
  }
});
