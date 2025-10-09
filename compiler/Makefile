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
	go test -v ./test...

build-all:
	GOOS=linux GOARCH=amd64 go build -o build/lynx-linux lynx.go
	GOOS=darwin GOARCH=amd64 go build -o build/lynx-macos lynx.go
	GOOS=windows GOARCH=amd64 go build -o build/lynx.exe lynx.go

clean:
	rm -rf $(BUILD_DIR)

