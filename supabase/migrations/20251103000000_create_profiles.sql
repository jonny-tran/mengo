-- NỘI DUNG MỚI CHO FILE MIGRATION '..._create_profiles.sql'

-- Xóa các policies cũ nếu có (chỉ khi bảng tồn tại)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "Allow all users to view profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
    END IF;
END $$;

-- Xóa trigger và function liên quan đến auth.users nếu có
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Xóa bảng profiles cũ (nếu có) và tất cả dependencies
-- CASCADE sẽ tự động xóa tất cả foreign keys từ các bảng khác
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Tạo bảng 'profiles' độc lập
-- Bảng này KHÔNG liên quan đến 'auth.users'
CREATE TABLE public.profiles (
    -- Đây là thay đổi quan trọng: 
    -- 'id' bây giờ tự tạo UUID và là Primary Key,
    -- nó KHÔNG còn tham chiếu (REFERENCES) 'auth.users' nữa.
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,

    -- Các cột OTP cho kiến trúc auth tùy chỉnh (từ Prompt 19)
    otp TEXT NULL,
    otp_expires_at TIMESTAMPTZ NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Kích hoạt RLS. Chúng ta sẽ tự quản lý policy
-- cho API tùy chỉnh của mình sau này.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy cho phép service role (bypass RLS) và anon key truy cập
-- Service role key sẽ bypass RLS, nhưng policy này đảm bảo an toàn
CREATE POLICY "Allow service role full access" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);
