.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

all: node_modules

adobe_setup:
	echo "--install.ignore-optional false" > .yarnrc
	git update-index --assume-unchanged .yarnrc

node_modules: package.json
	yarn install
	touch $@

# --ci keeps it from opening the browser tab automatically
run:
	NODE_ENV=storybook start-storybook -p 9003 --ci -c ".storybook-v3"

clean:
	yarn clean:icons
	rm -rf dist storybook-static storybook-static-v3 public src/dist

clean_all:
	$(MAKE) clean
	$(MAKE) clean_node_modules

clean_node_modules:
	rm -rf node_modules
	rm -rf packages/*/*/node_modules

packages/@spectrum-icons/workflow/src: packages/@spectrum-icons/workflow/package.json
	yarn workspace @spectrum-icons/workflow make-icons
	touch $@

packages/@spectrum-icons/workflow/%.js: packages/@spectrum-icons/workflow/src/%.tsx
	yarn workspace @spectrum-icons/workflow build-icons
	touch $@

workflow-icons: $(addprefix packages/@spectrum-icons/workflow/, $(notdir $(addsuffix .js, $(basename $(wildcard packages/@spectrum-icons/workflow/src/*.tsx)))))

packages/@spectrum-icons/color/src: packages/@spectrum-icons/color/package.json
	yarn workspace @spectrum-icons/color make-icons

packages/@spectrum-icons/color/%.js: packages/@spectrum-icons/color/src/%.tsx
	yarn workspace @spectrum-icons/color build-icons

color-icons: $(addprefix packages/@spectrum-icons/color/, $(notdir $(addsuffix .js, $(basename $(wildcard packages/@spectrum-icons/color/src/*.tsx)))))

packages/@spectrum-icons/ui/src: packages/@spectrum-icons/ui/package.json
	yarn workspace @spectrum-icons/ui make-icons
	touch $@

packages/@spectrum-icons/ui/%.js: packages/@spectrum-icons/ui/src/%.tsx
	yarn workspace @spectrum-icons/ui build-icons

ui-icons: packages/@spectrum-icons/ui/src $(addprefix packages/@spectrum-icons/ui/, $(notdir $(addsuffix .js, $(basename $(wildcard packages/@spectrum-icons/ui/src/*.tsx)))))

icons: packages/@spectrum-icons/workflow/src packages/@spectrum-icons/color/src packages/@spectrum-icons/ui/src
	@$(MAKE) workflow-icons
	@$(MAKE) color-icons
	@$(MAKE) ui-icons

lint:
	yarn check-types
	eslint packages --ext .js,.ts,.tsx
	node lint-packages.js

test:
	yarn jest

ci-test:
	yarn jest --maxWorkers=2

storybook:
	NODE_ENV=storybook yarn build-storybook

# for now doesn't have deploy since v3 doesn't have a place for docs and stuff yet
ci:
	$(MAKE) publish

publish: build
	lerna publish from-package --yes

build:
	parcel build packages/@react-{spectrum,aria,stately}/*/ --no-minify --no-scope-hoist

website:
	yarn build:docs --public-url /reactspectrum/$$(git rev-parse HEAD)/docs --dist-dir dist/$$(git rev-parse HEAD)/docs
