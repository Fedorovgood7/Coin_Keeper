package middleware

import (
	"context"
	"net/http"
	"strings"

	"coinkeeper/internal/domain/service"
	"coinkeeper/internal/presentation/http/response"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func Auth(sessionService service.SessionService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Unauthorized(w, "Missing authorization header")
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				response.Unauthorized(w, "Invalid authorization header format")
				return
			}

			token := parts[1]
			sessionData, err := sessionService.ValidateSession(r.Context(), token)
			if err != nil {
				response.Unauthorized(w, "Invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, sessionData.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserID(ctx context.Context) string {
	userID, ok := ctx.Value(UserIDKey).(string)
	if !ok {
		return ""
	}
	return userID
}
