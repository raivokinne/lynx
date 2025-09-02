BINARY_NAME = lynx
MAIN_PACKAGE = ./cmd/compiler
BUILD_DIR = ./web/server/build

.PHONY: build clean run

build:
	mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PACKAGE)

run: build
	./$(BUILD_DIR)/$(BINARY_NAME)

clean:
	rm -rf $(BUILD_DIR)

