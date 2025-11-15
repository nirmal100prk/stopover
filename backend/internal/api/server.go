package api

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"stopover.backend/config"
	"stopover.backend/internal/api/handler"
	"stopover.backend/internal/api/route"
	"stopover.backend/internal/repository"
	"stopover.backend/pkg/aviasales"

	// _ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func StartServer() {
	// Load configuration
	cfg := config.AppConfig

	rootCtx, cancelFunc := context.WithCancel(context.Background())
	defer cancelFunc()

	// init postgres db
	dbConn, err := repository.NewPostgres(context.Background(), cfg)
	if err != nil {
		log.Fatal(err.Error())
	}

	fClient := aviasales.NewFlightIntegrationClient(cfg.AviaSalesConfig.AviaSalesToken,
		cfg.AviaSalesConfig.AviaSalesMarker,
		cfg.AviaSalesConfig.AviaSalesHost, &cfg)

	fHnldr := handler.NewFlightHandler(fClient, &cfg)

	// Set up routes
	router := route.SetupRouter(fHnldr, &cfg)
	srv := &http.Server{
		Addr:    ":8084",
		Handler: router.Handler(),
	}
	// Start the server
	startHttpServer(srv)

	initGracefulShutdown(cancelFunc, dbConn, srv)
	<-rootCtx.Done()
}

func initGracefulShutdown(cancelFunc context.CancelFunc, dbConn *pgxpool.Pool, srv *http.Server) {

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	// kill (no params) by default sends syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught, so don't need add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// close db connection
	dbConn.Close()

	// shutdown server
	// stopping http server
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Println("Server Shutdown:", err)
	}

	cancelFunc()
	log.Println("Shutdown Server ...")
}

func startHttpServer(srv *http.Server) {

	go func() {
		// service connections
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()
}
