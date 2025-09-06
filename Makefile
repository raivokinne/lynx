BINARY_NAME = lynx
MAIN_PACKAGE = ./cmd/lynx
BUILD_DIR = ./web/server/build
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
	GOOS=linux GOARCH=amd64 go build -o build/lynx-linux ./cmd/lynx
	GOOS=darwin GOARCH=amd64 go build -o build/lynx-macos ./cmd/lynx
	GOOS=windows GOARCH=amd64 go build -o build/lynx.exe ./cmd/lynx

clean:
	rm -rf $(BUILD_DIR)

