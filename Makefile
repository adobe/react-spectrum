.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

all: node_modules

node_modules: package.json
	npm install
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

jenkins_test: lint
	NODE_ENV=test BABEL_ENV=cover nyc --reporter cobertura --report-dir . mocha $(MOCHA_OPTS) --reporter mocha-junit-reporter
	find ./node_modules/ -name coverage.json -exec rm {} \;

build:
	rm -rf dist
	cp -R src dist
	babel dist -d dist
	find dist \( -name index.styl -o -name "Shell*.styl" \) -exec bash -c 'f="{}"; o=$$(dirname $${f%.styl}.css); stylus --use ./bin/compile-stylus.js $$f -o $$o' \;
	find dist -name *.styl -delete
	find dist -name *.js -exec sed -i.bak 's/index.styl/index.css/g' {} \;
	find dist -name *.js -exec sed -i.bak -E 's/(Shell.*\.)styl/\1css/g' {} \;
	find dist -name *.bak -delete
	cp -R dist/* ./.
	rm -rf dist/*
	cp -R src/Icon/style/resources dist/.

storybook:
	build-storybook
	mkdir -p dist
	mv storybook-static dist/storybook

unprefix:
	find . -name *.js -not -path "./node_modules/*" -exec sed -i.bak 's/@react\/collection-view/collection-view/g' {} \;
	sed -i.bak 's/@react\///g' package.json
	find . -name "*.bak" -delete

