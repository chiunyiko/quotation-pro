
import { createClient } from '@supabase/supabase-js';

// 從環境變數讀取配置（部署到 Vercel 時需設定這些 Key）
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isConfigured = 
  supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  supabaseAnonKey;

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ error: new Error('系統目前為離線/Demo模式。請點擊 Demo 進入體驗。') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        upsert: () => Promise.resolve({ error: null }),
        delete: () => Promise.resolve({ error: null })
      })
    } as any;
