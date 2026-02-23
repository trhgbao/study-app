import { createClient } from '@supabase/supabase-js';

// Lấy biến môi trường từ file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Thiếu Supabase URL hoặc Anon Key. Hãy kiểm tra file .env.local");
}

// Khởi tạo client để sử dụng trong toàn bộ app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);