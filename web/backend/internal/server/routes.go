package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       int       `json:"id"`
	Email    string    `json:"email"`
	Password string    `json:"-"`
	CreateAt time.Time `json:"created_at"`
}

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CompileRequest struct {
	Code string `json:"code"`
}

var jwtSecret = []byte("secret")

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	api := r.Route("/api", func(r chi.Router) {
		r.Post("/register", s.registerHandler)
		r.Post("/login", s.loginHandler)
	})

	return api
}

func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	var existingUserID int
	checkQuery := "SELECT id FROM users WHERE email = $1"
	err := s.db.QueryRow(checkQuery, req.Email).Scan(&existingUserID)
	if err == nil {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	insertQuery := `
		INSERT INTO users (email, password, created_at)
		VALUES ($1, $2, NOW())
		RETURNING id, email, created_at`

	var user User
	err = s.db.QueryRow(insertQuery, req.Email, string(hashedPassword)).Scan(
		&user.ID, &user.Email, &user.CreateAt,
	)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	token, err := generateJWT(user.ID, user.Email)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := AuthResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	var user User
	var hashedPassword string
	query := "SELECT id, email, password, created_at FROM users WHERE email = $1"
	err := s.db.QueryRow(query, req.Email).Scan(
		&user.ID, &user.Email, &hashedPassword, &user.CreateAt,
	)
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	token, err := generateJWT(user.ID, user.Email)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := AuthResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateJWT(userID int, email string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func (s *Server) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			r = r.WithContext(context.WithValue(r.Context(), "user_id", claims["user_id"]))
			r = r.WithContext(context.WithValue(r.Context(), "email", claims["email"]))
		}

		next.ServeHTTP(w, r)
	})
}

func validateCode(code string) struct {
	valid   bool
	error   string
	message string
} {
	if code == "" {
		return struct {
			valid   bool
			error   string
			message string
		}{
			valid:   false,
			error:   "Code is required and must be a string",
			message: "Code is required and must be a string",
		}
	}
	if len(code) > CONFIG.MAX_FILE_SIZE {
		return struct {
			valid   bool
			error   string
			message string
		}{
			valid:   false,
			error:   "Code is too large",
			message: "Code is too large",
		}
	}
	return struct {
		valid   bool
		error   string
		message string
	}{
		valid:   true,
		message: "Code is valid",
	}
}

func executeCompiler(code string) (string, error) {
	cmd := exec.Command("../../build/compiler", code)
	output, err := cmd.Output()
	return string(output), err
}

func (s *Server) CompileHandler(w http.ResponseWriter, r *http.Request) {
	var req CompileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Code == "" {
		http.Error(w, "Code is required", http.StatusBadRequest)
		return
	}

	validation := validateCode(req.Code)
	if !validation.valid {
		http.Error(w, validation.error, http.StatusBadRequest)
		return
	}

	filename := fmt.Sprintf("code_%s%s", uuid.NewString(), CONFIG.FILE_EXTENSION)
	tempFilePath := filepath.Join(CONFIG.TEMP_DIR, filename)

	err := os.WriteFile(tempFilePath, []byte(req.Code), 0644)
	if err != nil {
		http.Error(w, "Failed to write temp file", http.StatusInternalServerError)
		return
	}

	output, err := executeCompiler(tempFilePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"output":  output,
	})
}
