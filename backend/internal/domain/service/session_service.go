package service

import "context"

type SessionData struct {
	UserID string
}

type SessionService interface {
	CreateSession(ctx context.Context, userID string) (token string, err error)
	ValidateSession(ctx context.Context, token string) (*SessionData, error)
	InvalidateSession(ctx context.Context, token string) error
}
