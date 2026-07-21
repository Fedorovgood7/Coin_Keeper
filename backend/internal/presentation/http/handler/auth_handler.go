package handler

import (
	"encoding/json"
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
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Code == "" {
		response.BadRequest(w, "Code is required")
		return
	}

	result, err := h.loginWithYandexUC.Execute(r.Context(), req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

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
