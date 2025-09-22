BINARY_NAME = lynx
MAIN_PACKAGE = ./lynx.go
BUILD_DIR = ../app/server/build
EXAMPLE ?= main.lynx

.PHONY: build clean run install test

build:
	mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PACKAGE)

run:
	go run $(MAIN_PACKAGE) ./examples/$(EXAMPLE)

install:
	go install $(MAIN_PACKAGE)

test:
	go test -v ./...

build-all:
	GOOS=linux GOARCH=amd64 go build -o build/lynx-linux main.go
	GOOS=darwin GOARCH=amd64 go build -o build/lynx-macos main.go
	GOOS=windows GOARCH=amd64 go build -o build/lynx.exe main.go

clean:
	rm -rf $(BUILD_DIR)

