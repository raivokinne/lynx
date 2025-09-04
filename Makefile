BINARY_NAME = lynx
MAIN_PACKAGE = ./cmd/lynx
BUILD_DIR = ./web/server/build
EXAMPLE ?= test.lynx

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

clean:
	rm -rf $(BUILD_DIR)

