# include .env
# export $(shell sed 's/=.*//' .env)

# Make this help target the default target
.DEFAULT_GOAL := help
# Use phony target
.PHONY: help

install: ## Default install
	npm install

reinstall: ## Reinstalls all packages
	find . -name 'node_modules' -exec rm -rf '{}' +
	npm install

reinstall-full: ## Reinstalls all packages + deletes lock files /*
	find . -name 'node_modules' -exec rm -rf '{}' +
	find . -name 'package-lock.json' -exec rm -rf '{}' +
	npm install

build: ## Builds Server
	rm -rf dist
	npm run build
	cp -R ./__scripts__ ./dist/__scripts__
	echo "start via [ make server ]"

server: ## Starts Server
	node ./dist/__scripts__/server.js

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
