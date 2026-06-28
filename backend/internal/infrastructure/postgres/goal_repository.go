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

type GoalRepository struct {
	db *sql.DB
}

func NewGoalRepository(db *sql.DB) repository.GoalRepository {
	return &GoalRepository{db: db}
}

func (r *GoalRepository) Create(ctx context.Context, goal *entity.SavingsGoal) error {
	goal.ID = uuid.New().String()
	now := time.Now()
	goal.CreatedAt = now
	goal.UpdatedAt = now

	query := `
		INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, deadline, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.ExecContext(
		ctx, query,
		goal.ID,
		goal.UserID,
		goal.Title,
		goal.TargetAmount,
		goal.CurrentAmount,
		goal.Deadline,
		goal.Status,
		goal.CreatedAt,
		goal.UpdatedAt,
	)

	return err
}

func (r *GoalRepository) GetByID(ctx context.Context, id string, userID string) (*entity.SavingsGoal, error) {
	query := `
		SELECT id, user_id, title, target_amount, current_amount, deadline, status, created_at, updated_at
		FROM savings_goals
		WHERE id = $1 AND user_id = $2
	`

	goal := &entity.SavingsGoal{}
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&goal.ID,
		&goal.UserID,
		&goal.Title,
		&goal.TargetAmount,
		&goal.CurrentAmount,
		&goal.Deadline,
		&goal.Status,
		&goal.CreatedAt,
		&goal.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}

	return goal, err
}

func (r *GoalRepository) GetByUserID(ctx context.Context, userID string) ([]*entity.SavingsGoal, error) {
	query := `
		SELECT id, user_id, title, target_amount, current_amount, deadline, status, created_at, updated_at
		FROM savings_goals
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	goals := make([]*entity.SavingsGoal, 0)
	for rows.Next() {
		goal := &entity.SavingsGoal{}
		err := rows.Scan(
			&goal.ID,
			&goal.UserID,
			&goal.Title,
			&goal.TargetAmount,
			&goal.CurrentAmount,
			&goal.Deadline,
			&goal.Status,
			&goal.CreatedAt,
			&goal.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		goals = append(goals, goal)
	}

	return goals, rows.Err()
}

func (r *GoalRepository) Update(ctx context.Context, goal *entity.SavingsGoal) error {
	goal.UpdatedAt = time.Now()

	query := `
		UPDATE savings_goals
		SET title = $1, target_amount = $2, current_amount = $3, deadline = $4, status = $5, updated_at = $6
		WHERE id = $7 AND user_id = $8
	`

	_, err := r.db.ExecContext(
		ctx, query,
		goal.Title,
		goal.TargetAmount,
		goal.CurrentAmount,
		goal.Deadline,
		goal.Status,
		goal.UpdatedAt,
		goal.ID,
		goal.UserID,
	)

	return err
}
