import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kdrbxhzihvurxyhcxxcr.supabase.co'
const supabaseKey = 'sb_publishable_TL7qImnj_Yv9N2clBj19Ow_qvHyMrMo'

export const supabase = createClient(supabaseUrl, supabaseKey)
