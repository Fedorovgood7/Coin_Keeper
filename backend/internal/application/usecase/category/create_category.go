package category

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"

	"github.com/google/uuid"
)

type CreateCategoryUseCase struct {
	categoryRepo repository.CategoryRepository
}

func NewCreateCategoryUseCase(categoryRepo repository.CategoryRepository) *CreateCategoryUseCase {
	return &CreateCategoryUseCase{categoryRepo: categoryRepo}
}

func (uc *CreateCategoryUseCase) Execute(ctx context.Context, userID string, req dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	color := req.Color
	if color == "" {
		color = "#808080"
	}
	icon := req.Icon
	if icon == "" {
		icon = "default"
	}

	category := &entity.Category{
		ID:        uuid.New().String(),
		UserID:    userID,
		Name:      req.Name,
		Type:      entity.CategoryType(req.Type),
		Color:     color,
		Icon:      icon,
		IsDefault: false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := uc.categoryRepo.Create(ctx, category); err != nil {
		return nil, err
	}

	return &dto.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		Type:      string(category.Type),
		Color:     category.Color,
		Icon:      category.Icon,
		IsDefault: category.IsDefault,
		CreatedAt: category.CreatedAt,
	}, nil
}
