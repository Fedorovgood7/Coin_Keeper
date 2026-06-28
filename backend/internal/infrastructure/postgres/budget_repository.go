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

type BudgetRepository struct {
	db *sql.DB
}

func NewBudgetRepository(db *sql.DB) repository.BudgetRepository {
	return &BudgetRepository{db: db}
}

func (r *BudgetRepository) Create(ctx context.Context, budget *entity.MonthlyBudget) error {
	budget.ID = uuid.New().String()
	now := time.Now()
	budget.CreatedAt = now
	budget.UpdatedAt = now

	query := `
		INSERT INTO monthly_budgets (id, user_id, month, planned_amount, actual_amount, safe_daily_amount, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(
		ctx, query,
		budget.ID,
		budget.UserID,
		budget.Month,
		budget.PlannedAmount,
		budget.ActualAmount,
		budget.SafeDailyAmount,
		budget.CreatedAt,
		budget.UpdatedAt,
	)

	return err
}

func (r *BudgetRepository) GetByMonth(ctx context.Context, userID string, month string) (*entity.MonthlyBudget, error) {
	query := `
		SELECT id, user_id, month, planned_amount, actual_amount, safe_daily_amount, created_at, updated_at
		FROM monthly_budgets
		WHERE user_id = $1 AND month = $2
	`

	budget := &entity.MonthlyBudget{}
	err := r.db.QueryRowContext(ctx, query, userID, month).Scan(
		&budget.ID,
		&budget.UserID,
		&budget.Month,
		&budget.PlannedAmount,
		&budget.ActualAmount,
		&budget.SafeDailyAmount,
		&budget.CreatedAt,
		&budget.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}

	return budget, err
}

func (r *BudgetRepository) Update(ctx context.Context, budget *entity.MonthlyBudget) error {
	budget.UpdatedAt = time.Now()

	query := `
		UPDATE monthly_budgets
		SET planned_amount = $1, actual_amount = $2, safe_daily_amount = $3, updated_at = $4
		WHERE id = $5 AND user_id = $6
	`

	_, err := r.db.ExecContext(
		ctx, query,
		budget.PlannedAmount,
		budget.ActualAmount,
		budget.SafeDailyAmount,
		budget.UpdatedAt,
		budget.ID,
		budget.UserID,
	)

	return err
}

func (r *BudgetRepository) CreateCategoryLimit(ctx context.Context, limit *entity.CategoryLimit) error {
	limit.ID = uuid.New().String()
	now := time.Now()
	limit.CreatedAt = now
	limit.UpdatedAt = now

	query := `
		INSERT INTO category_limits (id, user_id, category_id, month, "limit", spent, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(
		ctx, query,
		limit.ID,
		limit.UserID,
		limit.CategoryID,
		limit.Month,
		limit.Limit,
		limit.Spent,
		limit.CreatedAt,
		limit.UpdatedAt,
	)

	return err
}

func (r *BudgetRepository) GetCategoryLimits(ctx context.Context, userID string, month string) ([]*entity.CategoryLimit, error) {
	query := `
		SELECT id, user_id, category_id, month, "limit", spent, created_at, updated_at
		FROM category_limits
		WHERE user_id = $1 AND month = $2
		ORDER BY "limit" DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	limits := make([]*entity.CategoryLimit, 0)
	for rows.Next() {
		limit := &entity.CategoryLimit{}
		err := rows.Scan(
			&limit.ID,
			&limit.UserID,
			&limit.CategoryID,
			&limit.Month,
			&limit.Limit,
			&limit.Spent,
			&limit.CreatedAt,
			&limit.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		limits = append(limits, limit)
	}

	return limits, rows.Err()
}

func (r *BudgetRepository) GetCategoryLimit(ctx context.Context, categoryID string, userID string) (*entity.CategoryLimit, error) {
	query := `
		SELECT id, user_id, category_id, month, "limit", spent, created_at, updated_at
		FROM category_limits
		WHERE category_id = $1 AND user_id = $2
	`

	limit := &entity.CategoryLimit{}
	err := r.db.QueryRowContext(ctx, query, categoryID, userID).Scan(
		&limit.ID,
		&limit.UserID,
		&limit.CategoryID,
		&limit.Month,
		&limit.Limit,
		&limit.Spent,
		&limit.CreatedAt,
		&limit.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}

	return limit, err
}

func (r *BudgetRepository) UpdateCategoryLimit(ctx context.Context, limit *entity.CategoryLimit) error {
	limit.UpdatedAt = time.Now()

	query := `
		UPDATE category_limits
		SET "limit" = $1, spent = $2, updated_at = $3
		WHERE id = $4 AND user_id = $5
	`

	_, err := r.db.ExecContext(
		ctx, query,
		limit.Limit,
		limit.Spent,
		limit.UpdatedAt,
		limit.ID,
		limit.UserID,
	)

	return err
}
