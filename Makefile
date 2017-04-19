.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)
MOCHA_OPTS = --require ./test/.setup.js --recursive test

all: node_modules

node_modules: package.json
	npm install
	touch $@

run:
	start-storybook -p 9002

clean:
	rm -rf node_modules

lint:
	lfeslint

test: lint
	NODE_ENV=test mocha $(MOCHA_OPTS)

cover:
	NODE_ENV=test BABEL_ENV=cover nyc mocha $(MOCHA_OPTS)

build:
	cp -R src/* .
