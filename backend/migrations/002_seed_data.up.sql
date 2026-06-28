-- Demo data for testing
-- Run after 001_init_schema.up.sql

-- Insert demo user
INSERT INTO users (id, yandex_id, email, name, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'yandex-123456', 'demo@example.com', 'Demo User', 'https://avatars.example.com/demo.png');

-- Insert demo accounts
INSERT INTO accounts (id, user_id, name, type, currency, balance, initial_balance) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Основная карта', 'card', 'RUB', 45000.00, 50000.00),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Наличные', 'cash', 'RUB', 8500.00, 10000.00),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Накопительный счет', 'deposit', 'RUB', 125000.00, 100000.00);

-- Insert default categories (user_id = NULL, is_default = true)
INSERT INTO categories (id, user_id, name, type, color, icon, is_default) VALUES
('770e8400-e29b-41d4-a716-446655440001', NULL, 'Зарплата', 'income', '#4CAF50', 'money', true),
('770e8400-e29b-41d4-a716-446655440002', NULL, 'Фриланс', 'income', '#8BC34A', 'laptop', true),
('770e8400-e29b-41d4-a716-446655440003', NULL, 'Продукты', 'expense', '#FF9800', 'cart', true),
('770e8400-e29b-41d4-a716-446655440004', NULL, 'Транспорт', 'expense', '#2196F3', 'car', true),
('770e8400-e29b-41d4-a716-446655440005', NULL, 'Развлечения', 'expense', '#9C27B0', 'gamepad', true),
('770e8400-e29b-41d4-a716-446655440006', NULL, 'Рестораны', 'expense', '#F44336', 'utensils', true),
('770e8400-e29b-41d4-a716-446655440007', NULL, 'ЖКХ', 'expense', '#795548', 'home', true),
('770e8400-e29b-41d4-a716-446655440008', NULL, 'Здоровье', 'expense', '#E91E63', 'heart', true),
('770e8400-e29b-41d4-a716-446655440009', NULL, 'Одежда', 'expense', '#607D8B', 'shirt', true),
('770e8400-e29b-41d4-a716-446655440010', NULL, 'Образование', 'expense', '#3F51B5', 'book', true);

-- Insert user categories
INSERT INTO categories (id, user_id, name, type, color, icon, is_default) VALUES
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Подарки', 'expense', '#FF5722', 'gift', false),
('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Инвестиции', 'expense', '#009688', 'chart', false);

-- Insert transactions for current month
INSERT INTO transactions (id, user_id, type, amount, account_id, category_id, date, comment) VALUES
-- Income
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'income', 80000.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '20 days', 'Зарплата за месяц'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'income', 15000.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '15 days', 'Проект дизайн'),

-- Expenses
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'expense', 3500.00, '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '18 days', 'Продукты на неделю'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'expense', 1200.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '16 days', 'Такси'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'expense', 2800.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', CURRENT_DATE - INTERVAL '14 days', 'Ужин в ресторане'),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'expense', 5000.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440007', CURRENT_DATE - INTERVAL '12 days', 'Коммунальные услуги'),
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'expense', 1500.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', CURRENT_DATE - INTERVAL '10 days', 'Кино и попкорн'),
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'expense', 4200.00, '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '8 days', 'Продукты'),
('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'expense', 800.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '6 days', 'Метро'),
('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'expense', 3000.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440011', CURRENT_DATE - INTERVAL '4 days', 'Подарок другу'),

-- Transfer
('880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'transfer', 10000.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '2 days', 'Перевод на накопительный счет');

-- Update to_account_id for transfer
UPDATE transactions SET to_account_id = '660e8400-e29b-41d4-a716-446655440003' WHERE id = '880e8400-e29b-41d4-a716-446655440011';

-- Insert monthly budget
INSERT INTO monthly_budgets (user_id, month, planned_amount, actual_amount, safe_daily_amount) VALUES
('550e8400-e29b-41d4-a716-446655440000', to_char(CURRENT_DATE, 'YYYY-MM'), 50000.00, 26500.00, 1175.00);

-- Insert category limits
INSERT INTO category_limits (user_id, category_id, month, "limit", spent) VALUES
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', to_char(CURRENT_DATE, 'YYYY-MM'), 15000.00, 7700.00),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440004', to_char(CURRENT_DATE, 'YYYY-MM'), 5000.00, 2000.00),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440005', to_char(CURRENT_DATE, 'YYYY-MM'), 5000.00, 1500.00),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440006', to_char(CURRENT_DATE, 'YYYY-MM'), 8000.00, 2800.00),
('550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440007', to_char(CURRENT_DATE, 'YYYY-MM'), 7000.00, 5000.00);

-- Insert savings goals
INSERT INTO savings_goals (user_id, title, target_amount, current_amount, deadline, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Отпуск в Турции', 150000.00, 25000.00, CURRENT_DATE + INTERVAL '6 months', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'Новый ноутбук', 100000.00, 45000.00, CURRENT_DATE + INTERVAL '3 months', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'Подушка безопасности', 300000.00, 125000.00, CURRENT_DATE + INTERVAL '12 months', 'active');

-- Insert recurring payments
INSERT INTO recurring_payments (user_id, type, amount, account_id, category_id, periodicity, next_date, comment) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'expense', 5000.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440007', 'monthly', CURRENT_DATE + INTERVAL '5 days', 'Коммунальные услуги'),
('550e8400-e29b-41d4-a716-446655440000', 'expense', 699.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', 'monthly', CURRENT_DATE + INTERVAL '10 days', 'Подписка Netflix'),
('550e8400-e29b-41d4-a716-446655440000', 'expense', 1500.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440010', 'monthly', CURRENT_DATE + INTERVAL '15 days', 'Курсы английского'),
('550e8400-e29b-41d4-a716-446655440000', 'income', 80000.00, '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'monthly', CURRENT_DATE + INTERVAL '20 days', 'Зарплата');
