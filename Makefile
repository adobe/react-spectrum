.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

all: node_modules

node_modules: package.json
	npm install
	# npm installs the wrong react-select because of the bundledDependencies
	npm install git+https://0b7e8fbc147e13115b0fa573c41504bf441660fa:x-oauth-basic@git.corp.adobe.com/React/react-select.git#react-coral
	touch $@

run:
	start-storybook -p 9002

clean:
	rm -rf node_modules dist
	bash -c 'for f in src/*; do rm -rf $$(basename $$f); done'

lint:
	lfeslint

test: lint
	NODE_ENV=test mocha

cover:
	NODE_ENV=test BABEL_ENV=cover nyc mocha

build:
	cp -R src dist
	babel dist -d dist
	find dist -name index.styl -exec bash -c 'f="{}"; o=$$(dirname $${f%.styl}.css); stylus --use ./bin/compile-stylus.js $$f -o $$o' \;
	find dist -name *.styl -delete
	find dist -name *.js -exec sed -i.bak 's/index.styl/index.css/g' {} \;
	find dist -name *.bak -delete
	cp -R dist/* ./.
	rm -rf dist
