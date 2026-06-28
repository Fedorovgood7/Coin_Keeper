package category

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetCategoriesUseCase struct {
	categoryRepo repository.CategoryRepository
}

func NewGetCategoriesUseCase(categoryRepo repository.CategoryRepository) *GetCategoriesUseCase {
	return &GetCategoriesUseCase{categoryRepo: categoryRepo}
}

func (uc *GetCategoriesUseCase) Execute(ctx context.Context, userID string) ([]*dto.CategoryResponse, error) {
	categories, err := uc.categoryRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = &dto.CategoryResponse{
			ID:        category.ID,
			Name:      category.Name,
			Type:      string(category.Type),
			Color:     category.Color,
			Icon:      category.Icon,
			IsDefault: category.IsDefault,
			CreatedAt: category.CreatedAt,
		}
	}

	return responses, nil
}
