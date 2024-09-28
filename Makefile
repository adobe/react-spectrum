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
	rm -rf storage

clean_all:
	$(MAKE) clean
	$(MAKE) clean_node_modules
	$(MAKE) clean_dist
	$(MAKE) clean_parcel

clean_node_modules:
	rm -rf node_modules
	rm -rf packages/*/*/node_modules
	rm -rf examples/*/node_modules
	rm -rf starters/*/node_modules

clean_dist:
	rm -rf packages/*/*/dist
	rm -rf packages/{react-aria,react-aria-components,react-stately}/dist
	rm -rf packages/{react-aria,react-aria-components,react-stately}/i18n
	rm -rf packages/@adobe/react-spectrum/i18n
	rm -rf packages/@react-aria/i18n/server
	rm -rf packages/@react-spectrum/s2/style/dist packages/@react-spectrum/s2/page.css packages/@react-spectrum/s2/icons packages/@react-spectrum/s2/illustrations

clean_parcel:
	rm -rf .parcel-cache

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

storybook-19:
	yarn build:storybook-19

# for now doesn't have deploy since v3 doesn't have a place for docs and stuff yet
ci:
	$(MAKE) publish

publish: build
	yarn publish

publish-nightly: build
	yarn version:nightly
	yarn publish:nightly

build:
	parcel build packages/@react-{spectrum,aria,stately}/*/ packages/@internationalized/{message,string,date,number}/ packages/react-aria-components --no-optimize --config .parcelrc-build
	yarn workspaces foreach --all -pt run prepublishOnly
	for pkg in packages/@react-{spectrum,aria,stately}/*/  packages/@internationalized/{message,string,date,number}/ packages/@adobe/react-spectrum/ packages/react-aria/ packages/react-stately/ packages/react-aria-components/; \
		do node scripts/buildEsm.js $$pkg; \
	done
	node scripts/buildI18n.js
	node scripts/generateIconDts.js

website:
	yarn build:docs --public-url /reactspectrum/$$(git rev-parse HEAD)/docs --dist-dir dist/$$(git rev-parse HEAD)/docs
	cp packages/dev/docs/pages/disallow-robots.txt dist/$$(git rev-parse HEAD)/docs/robots.txt

website-production:
	node scripts/buildWebsite.js $$PUBLIC_URL
	cp packages/dev/docs/pages/robots.txt dist/production/docs/robots.txt
	$(MAKE) starter-zip
	$(MAKE) tailwind-starter
	$(MAKE) s2-docs

check-examples:
	node scripts/extractExamples.mjs
	yarn tsc --project dist/docs-examples/tsconfig.json

starter:
	node scripts/extractStarter.mjs
	cd starters/docs && yarn --no-immutable && yarn tsc

starter-zip: starter
	cp LICENSE starters/docs/.
	cd starters/docs && zip -r react-aria-starter.zip . -x .gitignore .DS_Store "node_modules/*" "storybook-static/*"
	mv starters/docs/react-aria-starter.zip dist/production/docs/react-aria-starter.$$(git rev-parse --short HEAD).zip
	cd starters/docs && yarn build-storybook
	mv starters/docs/storybook-static dist/production/docs/react-aria-starter

tailwind-starter:
	cp LICENSE starters/tailwind/.
	cd starters/tailwind && yarn --no-immutable && yarn tsc
	cd starters/tailwind && zip -r react-aria-tailwind-starter.zip . -x .gitignore .DS_Store "node_modules/*" "storybook-static/*"
	mv starters/tailwind/react-aria-tailwind-starter.zip dist/production/docs/react-aria-tailwind-starter.$$(git rev-parse --short HEAD).zip
	cd starters/tailwind && yarn build-storybook
	mv starters/tailwind/storybook-static dist/production/docs/react-aria-tailwind-starter

s2-docs:
	yarn build:s2-docs -o dist/production/docs/s2

s2-api-diff:
	node scripts/buildBranchAPI.js
	node scripts/api-diff.js --skip-same --skip-style-props
