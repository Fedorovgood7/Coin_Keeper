-- Make category_id nullable in transactions table
ALTER TABLE transactions ALTER COLUMN category_id DROP NOT NULL;
