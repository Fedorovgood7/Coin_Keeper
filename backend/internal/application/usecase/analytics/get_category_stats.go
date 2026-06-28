package analytics

import (
	"context"
	"sort"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetCategoryStatsUseCase struct {
	transactionRepo repository.TransactionRepository
	categoryRepo    repository.CategoryRepository
}

func NewGetCategoryStatsUseCase(
	transactionRepo repository.TransactionRepository,
	categoryRepo repository.CategoryRepository,
) *GetCategoryStatsUseCase {
	return &GetCategoryStatsUseCase{
		transactionRepo: transactionRepo,
		categoryRepo:    categoryRepo,
	}
}

func (uc *GetCategoryStatsUseCase) Execute(ctx context.Context, userID string, req dto.CategoryStatsRequest) (*dto.CategoryStatsResponse, error) {
	categoryTotals, err := uc.transactionRepo.GetTotalByCategory(ctx, userID, req.Month)
	if err != nil {
		return nil, err
	}

	categories, err := uc.categoryRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	categoryMap := make(map[string]string)
	for _, cat := range categories {
		categoryMap[cat.ID] = cat.Name
	}

	total := 0.0
	for _, amount := range categoryTotals {
		total += amount
	}

	items := make([]dto.CategoryStatItem, 0, len(categoryTotals))
	for categoryID, amount := range categoryTotals {
		name := categoryMap[categoryID]
		if name == "" {
			name = "Unknown"
		}

		percent := 0.0
		if total > 0 {
			percent = (amount / total) * 100
		}

		items = append(items, dto.CategoryStatItem{
			CategoryID: categoryID,
			Name:       name,
			Amount:     amount,
			Percent:    percent,
		})
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].Amount > items[j].Amount
	})

	return &dto.CategoryStatsResponse{
		Month:      req.Month,
		Categories: items,
		Total:      total,
	}, nil
}
