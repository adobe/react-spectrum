.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)
REACT := 0.14 15.5 16

all: node_modules

node_modules: package.json
	npm install
	touch $@

run:
	start-storybook -p 9002

clean:
	rm -rf node_modules dist storybook-static focus-ring-polyfill spectrum-css documentation/public documentation/node_modules
	bash -c 'for f in src/*; do rm -rf $$(basename $$f); done'

# --prefix needs to come before the command that npm is to run, otherwise documentation seems to indicate that it will write node_modules to that location
docs:
	npm --prefix ./documentation install
	npm --prefix ./documentation run build

docs_local:
	npm --prefix ./documentation install
	npm --prefix ./documentation run develop

lint:
	lfeslint

test:
	enzyme-adapter-react-install 16
	NODE_ENV=test mocha

cover:
	NODE_ENV=test BABEL_ENV=cover nyc mocha

jenkins_test: lint
	# Test each version of react
	@for version in $(REACT); do \
		enzyme-adapter-react-install $$version; \
		NODE_ENV=test mocha; \
	done

	# Test latest and generate coverage report
	NODE_ENV=test BABEL_ENV=cover nyc --reporter cobertura --report-dir . mocha $(MOCHA_OPTS) --reporter mocha-junit-reporter; \
	find ./node_modules/ -name coverage.json -exec rm {} \; ;\

build:
	rm -rf dist
	cp -R src dist
	cp -R node_modules/@spectrum/spectrum-css/dist/components dist/spectrum-css
	find dist/spectrum-css -name colorStops -exec rm -rf {} +;
	BUILD_ENV=production babel dist -d dist
	find dist \( -name index.styl -o -name "Shell*.styl" \) -exec bash -c 'f="{}"; o=$$(dirname $${f%.styl}.css); stylus --use ./bin/compile-stylus.js $$f -o $$o' \;
	find dist -name "*.styl" -delete
	find dist -name "*.js" -exec sed -i.bak 's/index.styl/index.css/g' {} \;
	find dist -name "*.js" -exec sed -i.bak -E 's/(Shell.*\.)styl/\1css/g' {} \;
	find dist -name "*.bak" -delete
	cp -R node_modules/@spectrum/focus-ring-polyfill dist/focus-ring-polyfill
	cp -R node_modules/@react/react-spectrum-icons/dist/* dist/Icon/.
	cp -R dist/* ./.
	rm -rf dist/*

storybook:
	build-storybook
	mkdir -p dist
	mv storybook-static dist/storybook

unprefix:
	find . -name *.js -not -path "./node_modules/*" -not -path "./src/*" -not -path "./test/*" -not -path "./documentation/*" -exec sed -i.bak 's/@react\/collection-view/collection-view/g' {} \;
	sed -i.bak 's/@react\///g' package.json
	find . -name "*.bak" -delete
