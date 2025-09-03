BINARY_NAME = lynx
MAIN_PACKAGE = ./cmd/lynx
BUILD_DIR = ./web/server/build

.PHONY: build clean run

build:
	mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PACKAGE)

run:
	go run ./cmd/lynx ./examples/test.lynx

install:
	go install ./cmd/lynx

clean:
	rm -rf $(BUILD_DIR)
