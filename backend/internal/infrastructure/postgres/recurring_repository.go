package postgres

import (
	"context"
	"database/sql"
	"time"

	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"

	"github.com/google/uuid"
)

type RecurringRepository struct {
	db *sql.DB
}

func NewRecurringRepository(db *sql.DB) repository.RecurringRepository {
	return &RecurringRepository{db: db}
}

func (r *RecurringRepository) Create(ctx context.Context, recurring *entity.RecurringPayment) error {
	recurring.ID = uuid.New().String()
	now := time.Now()
	recurring.CreatedAt = now
	recurring.UpdatedAt = now

	query := `
		INSERT INTO recurring_payments (id, user_id, type, amount, account_id, to_account_id, category_id, periodicity, next_date, comment, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`

	var toAccountID interface{}
	if recurring.ToAccountID != "" {
		toAccountID = recurring.ToAccountID
	}

	_, err := r.db.ExecContext(
		ctx, query,
		recurring.ID,
		recurring.UserID,
		recurring.Type,
		recurring.Amount,
		recurring.AccountID,
		toAccountID,
		recurring.CategoryID,
		recurring.Periodicity,
		recurring.NextDate,
		recurring.Comment,
		recurring.IsActive,
		recurring.CreatedAt,
		recurring.UpdatedAt,
	)

	return err
}

func (r *RecurringRepository) GetByID(ctx context.Context, id string, userID string) (*entity.RecurringPayment, error) {
	query := `
		SELECT id, user_id, type, amount, account_id, COALESCE(to_account_id, ''), category_id, periodicity, next_date, COALESCE(comment, ''), is_active, created_at, updated_at
		FROM recurring_payments
		WHERE id = $1 AND user_id = $2
	`

	recurring := &entity.RecurringPayment{}
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&recurring.ID,
		&recurring.UserID,
		&recurring.Type,
		&recurring.Amount,
		&recurring.AccountID,
		&recurring.ToAccountID,
		&recurring.CategoryID,
		&recurring.Periodicity,
		&recurring.NextDate,
		&recurring.Comment,
		&recurring.IsActive,
		&recurring.CreatedAt,
		&recurring.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}

	return recurring, err
}

func (r *RecurringRepository) GetByUserID(ctx context.Context, userID string) ([]*entity.RecurringPayment, error) {
	query := `
		SELECT id, user_id, type, amount, account_id, COALESCE(to_account_id, ''), category_id, periodicity, next_date, COALESCE(comment, ''), is_active, created_at, updated_at
		FROM recurring_payments
		WHERE user_id = $1
		ORDER BY next_date ASC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	recurringPayments := make([]*entity.RecurringPayment, 0)
	for rows.Next() {
		recurring := &entity.RecurringPayment{}
		err := rows.Scan(
			&recurring.ID,
			&recurring.UserID,
			&recurring.Type,
			&recurring.Amount,
			&recurring.AccountID,
			&recurring.ToAccountID,
			&recurring.CategoryID,
			&recurring.Periodicity,
			&recurring.NextDate,
			&recurring.Comment,
			&recurring.IsActive,
			&recurring.CreatedAt,
			&recurring.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		recurringPayments = append(recurringPayments, recurring)
	}

	return recurringPayments, rows.Err()
}

func (r *RecurringRepository) GetDuePayments(ctx context.Context) ([]*entity.RecurringPayment, error) {
	query := `
		SELECT id, user_id, type, amount, account_id, COALESCE(to_account_id, ''), category_id, periodicity, next_date, COALESCE(comment, ''), is_active, created_at, updated_at
		FROM recurring_payments
		WHERE is_active = true AND next_date <= NOW()
		ORDER BY next_date ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	recurringPayments := make([]*entity.RecurringPayment, 0)
	for rows.Next() {
		recurring := &entity.RecurringPayment{}
		err := rows.Scan(
			&recurring.ID,
			&recurring.UserID,
			&recurring.Type,
			&recurring.Amount,
			&recurring.AccountID,
			&recurring.ToAccountID,
			&recurring.CategoryID,
			&recurring.Periodicity,
			&recurring.NextDate,
			&recurring.Comment,
			&recurring.IsActive,
			&recurring.CreatedAt,
			&recurring.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		recurringPayments = append(recurringPayments, recurring)
	}

	return recurringPayments, rows.Err()
}

func (r *RecurringRepository) Update(ctx context.Context, recurring *entity.RecurringPayment) error {
	recurring.UpdatedAt = time.Now()

	query := `
		UPDATE recurring_payments
		SET type = $1, amount = $2, account_id = $3, to_account_id = $4, category_id = $5, periodicity = $6, next_date = $7, comment = $8, is_active = $9, updated_at = $10
		WHERE id = $11 AND user_id = $12
	`

	var toAccountID interface{}
	if recurring.ToAccountID != "" {
		toAccountID = recurring.ToAccountID
	}

	_, err := r.db.ExecContext(
		ctx, query,
		recurring.Type,
		recurring.Amount,
		recurring.AccountID,
		toAccountID,
		recurring.CategoryID,
		recurring.Periodicity,
		recurring.NextDate,
		recurring.Comment,
		recurring.IsActive,
		recurring.UpdatedAt,
		recurring.ID,
		recurring.UserID,
	)

	return err
}
