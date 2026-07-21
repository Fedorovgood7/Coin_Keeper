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

type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) repository.CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, category *entity.Category) error {
	category.ID = uuid.New().String()
	now := time.Now()
	category.CreatedAt = now
	category.UpdatedAt = now

	query := `
		INSERT INTO categories (id, user_id, name, type, color, icon, is_default, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.ExecContext(
		ctx, query,
		category.ID,
		category.UserID,
		category.Name,
		category.Type,
		category.Color,
		category.Icon,
		category.IsDefault,
		category.CreatedAt,
		category.UpdatedAt,
	)

	return err
}

func (r *CategoryRepository) GetByID(ctx context.Context, id string, userID string) (*entity.Category, error) {
	query := `
		SELECT id, user_id, name, type, color, icon, is_default, created_at, updated_at
		FROM categories
		WHERE id = $1 AND (user_id = $2 OR is_default = true)
	`

	category := &entity.Category{}
	var userIDNull sql.NullString
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&category.ID,
		&userIDNull,
		&category.Name,
		&category.Type,
		&category.Color,
		&category.Icon,
		&category.IsDefault,
		&category.CreatedAt,
		&category.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrNotFound
	}

	if userIDNull.Valid {
		category.UserID = userIDNull.String
	}

	return category, err
}

func (r *CategoryRepository) GetByUserID(ctx context.Context, userID string) ([]*entity.Category, error) {
	query := `
		SELECT id, user_id, name, type, color, icon, is_default, created_at, updated_at
		FROM categories
		WHERE user_id = $1 OR is_default = true
		ORDER BY is_default DESC, created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := make([]*entity.Category, 0)
	for rows.Next() {
		category := &entity.Category{}
		var userIDNull sql.NullString
		err := rows.Scan(
			&category.ID,
			&userIDNull,
			&category.Name,
			&category.Type,
			&category.Color,
			&category.Icon,
			&category.IsDefault,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		if userIDNull.Valid {
			category.UserID = userIDNull.String
		}
		categories = append(categories, category)
	}

	return categories, rows.Err()
}

func (r *CategoryRepository) GetDefaultCategories(ctx context.Context) ([]*entity.Category, error) {
	query := `
		SELECT id, user_id, name, type, color, icon, is_default, created_at, updated_at
		FROM categories
		WHERE is_default = true
		ORDER BY created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := make([]*entity.Category, 0)
	for rows.Next() {
		category := &entity.Category{}
		var userIDNull sql.NullString
		err := rows.Scan(
			&category.ID,
			&userIDNull,
			&category.Name,
			&category.Type,
			&category.Color,
			&category.Icon,
			&category.IsDefault,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		if userIDNull.Valid {
			category.UserID = userIDNull.String
		}
		categories = append(categories, category)
	}

	return categories, rows.Err()
}

func (r *CategoryRepository) Update(ctx context.Context, category *entity.Category) error {
	category.UpdatedAt = time.Now()

	query := `
		UPDATE categories
		SET name = $1, color = $2, icon = $3, updated_at = $4
		WHERE id = $5 AND user_id = $6
	`

	_, err := r.db.ExecContext(
		ctx, query,
		category.Name,
		category.Color,
		category.Icon,
		category.UpdatedAt,
		category.ID,
		category.UserID,
	)

	return err
}
