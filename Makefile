.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

all: node_modules

node_modules: package.json
	yarn install
	touch $@

run_chromatic:
	NODE_ENV=storybook start-storybook -p 9004 --ci -c ".chromatic"

clean:
	yarn clean:icons
	rm -rf dist public src/dist

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

packages/@spectrum-icons/illustrations/%.js: packages/@spectrum-icons/illustrations/src/%.tsx
	yarn workspace @spectrum-icons/illustrations build-icons

illustrations: packages/@spectrum-icons/illustrations/src $(addprefix packages/@spectrum-icons/illustrations/, $(notdir $(addsuffix .js, $(basename $(wildcard packages/@spectrum-icons/illustrations/src/*.tsx)))))

icons: packages/@spectrum-icons/workflow/src packages/@spectrum-icons/color/src packages/@spectrum-icons/ui/src packages/@spectrum-icons/illustrations/src
	@$(MAKE) workflow-icons
	@$(MAKE) color-icons
	@$(MAKE) ui-icons
	@$(MAKE) illustrations

storybook:
	NODE_ENV=production yarn build:storybook

storybook-16:
	yarn build:storybook-16

storybook-17:
	yarn build:storybook-17

# for now doesn't have deploy since v3 doesn't have a place for docs and stuff yet
ci:
	$(MAKE) publish

publish: build
	yarn publish

publish-nightly: build
	yarn publish:nightly

build:
	parcel build packages/@react-{spectrum,aria,stately}/*/ packages/@internationalized/{message,string,date,number}/ packages/react-aria-components --no-optimize
	yarn lerna run prepublishOnly
	for pkg in packages/@react-{spectrum,aria,stately}/*/  packages/@internationalized/{message,string,date,number}/ packages/@adobe/react-spectrum/ packages/react-aria/ packages/react-stately/ packages/react-aria-components/; \
		do cp $$pkg/dist/module.js $$pkg/dist/import.mjs; \
	done
	sed -i.bak s/\.js/\.mjs/ packages/@react-aria/i18n/dist/import.mjs
	rm packages/@react-aria/i18n/dist/import.mjs.bak

website:
	yarn build:docs --public-url /reactspectrum/$$(git rev-parse HEAD)/docs --dist-dir dist/$$(git rev-parse HEAD)/docs

website-production:
	node scripts/buildWebsite.js
	cp packages/dev/docs/pages/robots.txt dist/production/docs/robots.txt

check-examples:
	node scripts/extractExamples.mjs
	yarn tsc --project dist/docs-examples/tsconfig.json
