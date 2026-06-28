package response

import (
	"encoding/json"
	"net/http"

	"coinkeeper/internal/domain"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

func Error(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{
		Error:   http.StatusText(status),
		Message: message,
	})
}

func BadRequest(w http.ResponseWriter, message string) {
	Error(w, http.StatusBadRequest, message)
}

func Unauthorized(w http.ResponseWriter, message string) {
	Error(w, http.StatusUnauthorized, message)
}

func Forbidden(w http.ResponseWriter, message string) {
	Error(w, http.StatusForbidden, message)
}

func NotFound(w http.ResponseWriter, message string) {
	Error(w, http.StatusNotFound, message)
}

func InternalServerError(w http.ResponseWriter, message string) {
	Error(w, http.StatusInternalServerError, message)
}

func HandleDomainError(w http.ResponseWriter, err error) {
	switch err {
	case domain.ErrNotFound:
		NotFound(w, "Entity not found")
	case domain.ErrAlreadyExists:
		BadRequest(w, "Entity already exists")
	case domain.ErrUnauthorized:
		Unauthorized(w, "Unauthorized")
	case domain.ErrForbidden:
		Forbidden(w, "Forbidden")
	case domain.ErrInvalidInput:
		BadRequest(w, "Invalid input")
	case domain.ErrInsufficientFunds:
		BadRequest(w, "Insufficient funds")
	case domain.ErrBudgetExceeded:
		BadRequest(w, "Budget limit exceeded")
	case domain.ErrAccountArchived:
		BadRequest(w, "Account is archived")
	default:
		InternalServerError(w, "Internal server error")
	}
}
