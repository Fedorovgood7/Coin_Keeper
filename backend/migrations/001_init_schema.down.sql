-- Drop triggers
DROP TRIGGER IF EXISTS update_recurring_payments_updated_at ON recurring_payments;
DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON savings_goals;
DROP TRIGGER IF EXISTS update_category_limits_updated_at ON category_limits;
DROP TRIGGER IF EXISTS update_monthly_budgets_updated_at ON monthly_budgets;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS recurring_payments;
DROP TABLE IF EXISTS savings_goals;
DROP TABLE IF EXISTS category_limits;
DROP TABLE IF EXISTS monthly_budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;
