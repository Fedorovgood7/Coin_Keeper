package auth

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
	"coinkeeper/internal/domain/service"
)

type LoginWithYandexUseCase struct {
	userRepo       repository.UserRepository
	oauthService   service.OAuthService
	sessionService service.SessionService
}

func NewLoginWithYandexUseCase(
	userRepo repository.UserRepository,
	oauthService service.OAuthService,
	sessionService service.SessionService,
) *LoginWithYandexUseCase {
	return &LoginWithYandexUseCase{
		userRepo:       userRepo,
		oauthService:   oauthService,
		sessionService: sessionService,
	}
}

func (uc *LoginWithYandexUseCase) Execute(ctx context.Context, req dto.LoginWithYandexRequest) (*dto.AuthResponse, error) {
	accessToken, err := uc.oauthService.ExchangeCode(ctx, req.Code)
	if err != nil {
		return nil, domain.ErrUnauthorized
	}

	yandexUser, err := uc.oauthService.GetUserInfo(ctx, accessToken)
	if err != nil {
		return nil, domain.ErrUnauthorized
	}

	user, err := uc.userRepo.GetByYandexID(ctx, yandexUser.ID)
	if err != nil {
		if err == domain.ErrNotFound {
			user = &entity.User{
				YandexID:  yandexUser.ID,
				Email:     yandexUser.Email,
				Name:      yandexUser.Name,
				AvatarURL: yandexUser.AvatarURL,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			if err := uc.userRepo.Create(ctx, user); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	token, err := uc.sessionService.CreateSession(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		Token: token,
		User: &dto.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			AvatarURL: user.AvatarURL,
		},
	}, nil
}
