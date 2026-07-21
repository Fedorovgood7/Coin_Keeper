package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/auth"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"
)

type AuthHandler struct {
	loginWithYandexUC *auth.LoginWithYandexUseCase
	getProfileUC      *auth.GetProfileUseCase
}

func NewAuthHandler(
	loginWithYandexUC *auth.LoginWithYandexUseCase,
	getProfileUC *auth.GetProfileUseCase,
) *AuthHandler {
	return &AuthHandler{
		loginWithYandexUC: loginWithYandexUC,
		getProfileUC:      getProfileUC,
	}
}

func (h *AuthHandler) LoginWithYandex(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginWithYandexRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[auth] invalid request body: %v", err)
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Code == "" {
		log.Printf("[auth] empty code")
		response.BadRequest(w, "Code is required")
		return
	}

	log.Printf("[auth] login attempt with code: %s...", req.Code[:min(8, len(req.Code))])

	result, err := h.loginWithYandexUC.Execute(r.Context(), req)
	if err != nil {
		log.Printf("[auth] login failed: %v", err)
		response.HandleDomainError(w, err)
		return
	}

	log.Printf("[auth] login success for user: %s", result.User.ID)
	response.OK(w, result)
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		response.Unauthorized(w, "Unauthorized")
		return
	}

	result, err := h.getProfileUC.Execute(r.Context(), userID)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	response.OK(w, map[string]string{"message": "Logged out successfully"})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
