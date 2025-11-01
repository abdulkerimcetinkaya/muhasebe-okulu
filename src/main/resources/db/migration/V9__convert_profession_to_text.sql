-- Migration: Convert profession from enum to VARCHAR for free text input
-- Date: 2025-10-30
-- Description: Allows users to enter any profession they want instead of being limited to predefined values

-- Step 1: Add temporary column with VARCHAR type
ALTER TABLE users ADD COLUMN profession_temp VARCHAR(100);

-- Step 2: Copy existing enum values to temp column (convert to Turkish display names for backward compatibility)
UPDATE users SET profession_temp =
    CASE profession::text
        WHEN 'STUDENT' THEN 'Öğrenci'
        WHEN 'ACCOUNTANT' THEN 'Muhasebeci'
        WHEN 'AUDITOR' THEN 'Denetçi'
        WHEN 'CFO' THEN 'Mali İşler Müdürü'
        WHEN 'TAX_CONSULTANT' THEN 'Mali Müşavir'
        WHEN 'FINANCIAL_ANALYST' THEN 'Finansal Analist'
        WHEN 'BOOKKEEPER' THEN 'Defter Tutan'
        WHEN 'OTHER' THEN 'Diğer'
        ELSE profession::text
    END
WHERE profession IS NOT NULL;

-- Step 3: Drop old enum column
ALTER TABLE users DROP COLUMN profession;

-- Step 4: Rename temp column to profession
ALTER TABLE users RENAME COLUMN profession_temp TO profession;

-- Step 5: Add comment
COMMENT ON COLUMN users.profession IS 'Meslek (serbest metin, max 100 karakter)';
