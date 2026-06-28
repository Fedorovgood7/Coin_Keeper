package service

import "context"

type YandexUserInfo struct {
	ID        string
	Email     string
	Name      string
	AvatarURL string
}

type OAuthService interface {
	ExchangeCode(ctx context.Context, code string) (accessToken string, err error)
	GetUserInfo(ctx context.Context, accessToken string) (*YandexUserInfo, error)
}
