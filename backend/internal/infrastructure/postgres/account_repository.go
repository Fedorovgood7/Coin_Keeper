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

type AccountRepository struct {
	db *sql.DB
}

func NewAccountRepository(db *sql.DB) repository.AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) Create(ctx context.Context, account *entity.Account) error {
	account.ID = uuid.New().String()
	now := time.Now()
	account.CreatedAt = now
	account.UpdatedAt = now

	query := `
		INSERT INTO accounts (id, user_id, name, type, currency, balance, initial_balance, is_archived, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := r.db.ExecContext(
		ctx, query,
		account.ID,
		account.UserID,
		account.Name,
		account.Type,
		account.Currency,
		account.Balance,
		account.InitialBalance,
		account.IsArchived,
		account.CreatedAt,
		account.UpdatedAt,
	)

	return err
}

func (r *AccountRepository) GetByID(ctx context.Context, id string, userID string) (*entity.Account, error) {
	query := `
		SELECT id, user_id, name, type, currency, balance, initial_balance, is_archived, created_at, updated_at
		FROM accounts
		WHERE id = $1 AND user_id = $2
	`

	account := &entity.Account{}
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&account.ID,
		&account.UserID,
		&account.Name,
		&account.Type,
		&account.Currency,
		&account.Balance,
		&account.InitialBalance,
		&account.IsArchived,
		&account.CreatedAt,
		&account.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}

	return account, err
}

func (r *AccountRepository) GetByUserID(ctx context.Context, userID string) ([]*entity.Account, error) {
	query := `
		SELECT id, user_id, name, type, currency, balance, initial_balance, is_archived, created_at, updated_at
		FROM accounts
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	accounts := make([]*entity.Account, 0)
	for rows.Next() {
		account := &entity.Account{}
		err := rows.Scan(
			&account.ID,
			&account.UserID,
			&account.Name,
			&account.Type,
			&account.Currency,
			&account.Balance,
			&account.InitialBalance,
			&account.IsArchived,
			&account.CreatedAt,
			&account.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, account)
	}

	return accounts, rows.Err()
}

func (r *AccountRepository) Update(ctx context.Context, account *entity.Account) error {
	account.UpdatedAt = time.Now()

	query := `
		UPDATE accounts
		SET name = $1, balance = $2, is_archived = $3, updated_at = $4
		WHERE id = $5 AND user_id = $6
	`

	_, err := r.db.ExecContext(
		ctx, query,
		account.Name,
		account.Balance,
		account.IsArchived,
		account.UpdatedAt,
		account.ID,
		account.UserID,
	)

	return err
}

func (r *AccountRepository) Archive(ctx context.Context, id string, userID string) error {
	query := `
		UPDATE accounts
		SET is_archived = true, updated_at = $1
		WHERE id = $2 AND user_id = $3
	`

	_, err := r.db.ExecContext(ctx, query, time.Now(), id, userID)
	return err
}
