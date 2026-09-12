// Package platform constructs GCP clients. No business logic here.
package platform

import (
	"context"
	"fmt"

	"github.com/fcj6202/code-reviewer/backend/internal/config"
	"google.golang.org/genai"
)

// Gemini wraps the Vertex AI GenAI client with the configured model name.
type Gemini struct {
	Client *genai.Client
	Model  string
}

func NewGemini(ctx context.Context, cfg config.Config) (*Gemini, error) {
	if cfg.ProjectID == "" {
		return nil, fmt.Errorf("PROJECT_ID is required")
	}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		Backend:  genai.BackendVertexAI,
		Project:  cfg.ProjectID,
		Location: cfg.GeminiLocation,
	})
	if err != nil {
		return nil, err
	}
	return &Gemini{Client: client, Model: cfg.GeminiModel}, nil
}
