package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"

	"github.com/google/uuid"
)

type TransactionRepository struct {
	db *sql.DB
}

func NewTransactionRepository(db *sql.DB) repository.TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) Create(ctx context.Context, transaction *entity.Transaction) error {
	transaction.ID = uuid.New().String()
	transaction.CreatedAt = time.Now()

	query := `
		INSERT INTO transactions (id, user_id, type, amount, account_id, to_account_id, category_id, date, comment, recurring_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	var toAccountID interface{}
	if transaction.ToAccountID != "" {
		toAccountID = transaction.ToAccountID
	}

	var recurringID interface{}
	if transaction.RecurringID != "" {
		recurringID = transaction.RecurringID
	}

	_, err := r.db.ExecContext(
		ctx, query,
		transaction.ID,
		transaction.UserID,
		transaction.Type,
		transaction.Amount,
		transaction.AccountID,
		toAccountID,
		transaction.CategoryID,
		transaction.Date,
		transaction.Comment,
		recurringID,
		transaction.CreatedAt,
	)

	return err
}

func (r *TransactionRepository) GetByID(ctx context.Context, id string, userID string) (*entity.Transaction, error) {
	query := `
		SELECT id, user_id, type, amount, account_id, COALESCE(to_account_id, ''), category_id, date, COALESCE(comment, ''), COALESCE(recurring_id, ''), created_at
		FROM transactions
		WHERE id = $1 AND user_id = $2
	`

	transaction := &entity.Transaction{}
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&transaction.ID,
		&transaction.UserID,
		&transaction.Type,
		&transaction.Amount,
		&transaction.AccountID,
		&transaction.ToAccountID,
		&transaction.CategoryID,
		&transaction.Date,
		&transaction.Comment,
		&transaction.RecurringID,
		&transaction.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}

	return transaction, err
}

func (r *TransactionRepository) GetByFilter(ctx context.Context, filter repository.TransactionFilter) ([]*entity.Transaction, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, fmt.Sprintf("user_id = $%d", argIndex))
	args = append(args, filter.UserID)
	argIndex++

	if filter.DateFrom != nil {
		conditions = append(conditions, fmt.Sprintf("date >= $%d", argIndex))
		args = append(args, *filter.DateFrom)
		argIndex++
	}

	if filter.DateTo != nil {
		conditions = append(conditions, fmt.Sprintf("date <= $%d", argIndex))
		args = append(args, *filter.DateTo)
		argIndex++
	}

	if filter.AccountID != "" {
		conditions = append(conditions, fmt.Sprintf("(account_id = $%d OR to_account_id = $%d)", argIndex, argIndex))
		args = append(args, filter.AccountID)
		argIndex++
	}

	if filter.CategoryID != "" {
		conditions = append(conditions, fmt.Sprintf("category_id = $%d", argIndex))
		args = append(args, filter.CategoryID)
		argIndex++
	}

	if filter.Type != "" {
		conditions = append(conditions, fmt.Sprintf("type = $%d", argIndex))
		args = append(args, filter.Type)
		argIndex++
	}

	query := `
		SELECT id, user_id, type, amount, account_id, COALESCE(to_account_id, ''), category_id, date, COALESCE(comment, ''), COALESCE(recurring_id, ''), created_at
		FROM transactions
		WHERE ` + strings.Join(conditions, " AND ") + `
		ORDER BY date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	transactions := make([]*entity.Transaction, 0)
	for rows.Next() {
		transaction := &entity.Transaction{}
		err := rows.Scan(
			&transaction.ID,
			&transaction.UserID,
			&transaction.Type,
			&transaction.Amount,
			&transaction.AccountID,
			&transaction.ToAccountID,
			&transaction.CategoryID,
			&transaction.Date,
			&transaction.Comment,
			&transaction.RecurringID,
			&transaction.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}

	return transactions, rows.Err()
}

func (r *TransactionRepository) Update(ctx context.Context, transaction *entity.Transaction) error {
	query := `
		UPDATE transactions
		SET amount = $1, category_id = $2, date = $3, comment = $4
		WHERE id = $5 AND user_id = $6
	`

	_, err := r.db.ExecContext(
		ctx, query,
		transaction.Amount,
		transaction.CategoryID,
		transaction.Date,
		transaction.Comment,
		transaction.ID,
		transaction.UserID,
	)

	return err
}

func (r *TransactionRepository) Delete(ctx context.Context, id string, userID string) error {
	query := `DELETE FROM transactions WHERE id = $1 AND user_id = $2`
	_, err := r.db.ExecContext(ctx, query, id, userID)
	return err
}

func (r *TransactionRepository) GetTotalByCategory(ctx context.Context, userID string, month string) (map[string]float64, error) {
	query := `
		SELECT category_id, COALESCE(SUM(amount), 0)
		FROM transactions
		WHERE user_id = $1
		  AND type = 'expense'
		  AND to_char(date, 'YYYY-MM') = $2
		GROUP BY category_id
	`

	rows, err := r.db.QueryContext(ctx, query, userID, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]float64)
	for rows.Next() {
		var categoryID string
		var total float64
		if err := rows.Scan(&categoryID, &total); err != nil {
			return nil, err
		}
		result[categoryID] = total
	}

	return result, rows.Err()
}

func (r *TransactionRepository) GetDailyTotals(ctx context.Context, userID string, month string) (map[string]float64, error) {
	query := `
		SELECT to_char(date, 'YYYY-MM-DD'), COALESCE(SUM(amount), 0)
		FROM transactions
		WHERE user_id = $1
		  AND type = 'expense'
		  AND to_char(date, 'YYYY-MM') = $2
		GROUP BY to_char(date, 'YYYY-MM-DD')
		ORDER BY to_char(date, 'YYYY-MM-DD')
	`

	rows, err := r.db.QueryContext(ctx, query, userID, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]float64)
	for rows.Next() {
		var date string
		var total float64
		if err := rows.Scan(&date, &total); err != nil {
			return nil, err
		}
		result[date] = total
	}

	return result, rows.Err()
}

func (r *TransactionRepository) GetIncomeTotal(ctx context.Context, userID string, month string) (float64, error) {
	query := `
		SELECT COALESCE(SUM(amount), 0)
		FROM transactions
		WHERE user_id = $1
		  AND type = 'income'
		  AND to_char(date, 'YYYY-MM') = $2
	`

	var total float64
	err := r.db.QueryRowContext(ctx, query, userID, month).Scan(&total)
	return total, err
}

func (r *TransactionRepository) GetExpenseTotal(ctx context.Context, userID string, month string) (float64, error) {
	query := `
		SELECT COALESCE(SUM(amount), 0)
		FROM transactions
		WHERE user_id = $1
		  AND type = 'expense'
		  AND to_char(date, 'YYYY-MM') = $2
	`

	var total float64
	err := r.db.QueryRowContext(ctx, query, userID, month).Scan(&total)
	return total, err
}
