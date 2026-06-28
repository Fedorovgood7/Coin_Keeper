package auth

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetProfileUseCase struct {
	userRepo repository.UserRepository
}

func NewGetProfileUseCase(userRepo repository.UserRepository) *GetProfileUseCase {
	return &GetProfileUseCase{userRepo: userRepo}
}

func (uc *GetProfileUseCase) Execute(ctx context.Context, userID string) (*dto.UserResponse, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		AvatarURL: user.AvatarURL,
	}, nil
}
