
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kdrbxhzihvurxyhcxxcr.supabase.co'
const supabaseKey = 'sb_publishable_TL7qImnj_Yv9N2clBj19Ow_qvHyMrMo'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,      // mantém login entre abas
    autoRefreshToken: true,    // renova token automaticamente
    detectSessionInUrl: false, // evita conflito com rotas SPA
    storageKey: 'app-auth'     // 🔥 evita conflito com outros projetos
  }
})