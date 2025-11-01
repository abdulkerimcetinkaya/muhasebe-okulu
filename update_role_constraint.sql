-- Manuel olarak role constraint'ini güncelle
-- Bu SQL'i PostgreSQL'de çalıştırın

-- 1. Mevcut constraint'i kaldır
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Yeni constraint'i TEACHER rolü ile ekle
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'TEACHER', 'ADMIN'));

-- 3. Kontrol et
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';



