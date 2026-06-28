package entity

import "time"

type User struct {
	ID        string
	YandexID  string
	Email     string
	Name      string
	AvatarURL string
	CreatedAt time.Time
	UpdatedAt time.Time
}
