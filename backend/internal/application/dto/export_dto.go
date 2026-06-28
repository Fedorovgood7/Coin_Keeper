package dto

import "time"

type ExportCSVRequest struct {
	DateFrom *time.Time `form:"date_from"`
	DateTo   *time.Time `form:"date_to"`
}
