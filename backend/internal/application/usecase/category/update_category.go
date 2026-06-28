package category

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type UpdateCategoryUseCase struct {
	categoryRepo repository.CategoryRepository
}

func NewUpdateCategoryUseCase(categoryRepo repository.CategoryRepository) *UpdateCategoryUseCase {
	return &UpdateCategoryUseCase{categoryRepo: categoryRepo}
}

func (uc *UpdateCategoryUseCase) Execute(ctx context.Context, userID string, req dto.UpdateCategoryRequest) (*dto.CategoryResponse, error) {
	category, err := uc.categoryRepo.GetByID(ctx, req.ID, userID)
	if err != nil {
		return nil, err
	}

	if req.Color != nil {
		category.UpdateColor(*req.Color)
	}

	if req.Icon != nil {
		category.UpdateIcon(*req.Icon)
	}

	if err := uc.categoryRepo.Update(ctx, category); err != nil {
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
