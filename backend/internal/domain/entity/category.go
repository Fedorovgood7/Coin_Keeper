package entity

import "time"

type CategoryType string

const (
	CategoryTypeIncome  CategoryType = "income"
	CategoryTypeExpense CategoryType = "expense"
)

type Category struct {
	ID        string
	UserID    string
	Name      string
	Type      CategoryType
	Color     string
	Icon      string
	IsDefault bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (c *Category) UpdateColor(color string) {
	c.Color = color
	c.UpdatedAt = time.Now()
}

func (c *Category) UpdateIcon(icon string) {
	c.Icon = icon
	c.UpdatedAt = time.Now()
}
