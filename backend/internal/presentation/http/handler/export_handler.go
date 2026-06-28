package handler

import (
	"encoding/csv"
	"net/http"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/export"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"
)

type ExportHandler struct {
	exportTransactionsCSVUC *export.ExportTransactionsCSVUseCase
}

func NewExportHandler(exportUC *export.ExportTransactionsCSVUseCase) *ExportHandler {
	return &ExportHandler{exportTransactionsCSVUC: exportUC}
}

func (h *ExportHandler) ExportCSV(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	req := dto.ExportCSVRequest{}

	if dateFrom := r.URL.Query().Get("date_from"); dateFrom != "" {
		t, err := time.Parse(time.RFC3339, dateFrom)
		if err == nil {
			req.DateFrom = &t
		}
	}

	if dateTo := r.URL.Query().Get("date_to"); dateTo != "" {
		t, err := time.Parse(time.RFC3339, dateTo)
		if err == nil {
			req.DateTo = &t
		}
	}

	records, err := h.exportTransactionsCSVUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", "attachment; filename=transactions.csv")

	csvWriter := csv.NewWriter(w)
	defer csvWriter.Flush()

	for _, record := range records {
		if err := csvWriter.Write(record); err != nil {
			response.InternalServerError(w, "Failed to write CSV")
			return
		}
	}
}
