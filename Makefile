.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)
BRANCH := $(or $(CIRCLE_BRANCH),$(shell git rev-parse --abbrev-ref HEAD))
BRANCH_TYPE := $(if $(filter $(BRANCH),main),main,pr)
HASH := $(shell git rev-parse HEAD)

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

# for now doesn't have deploy since v3 doesn't have a place for docs and stuff yet
ci:
	$(MAKE) publish

publish: build
	yarn publish

publish-nightly: build
	rm -f .git/index
	git reset
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
	node scripts/fixUseClient.js

website:
	yarn build:docs --public-url /reactspectrum/$$(git rev-parse HEAD)/docs --dist-dir dist/$$(git rev-parse HEAD)/docs
	cp packages/dev/docs/pages/disallow-robots.txt dist/$$(git rev-parse HEAD)/docs/robots.txt

website-production:
	node scripts/buildWebsite.js $$PUBLIC_URL
	cp packages/dev/docs/pages/robots.txt dist/production/docs/robots.txt
	# Uncomment this when we are ready to release.
	# $(MAKE) s2-docs-production
	$(MAKE) starter-zip
	$(MAKE) tailwind-starter
	$(MAKE) s2-storybook-docs
	mv starters/docs/storybook-static dist/production/docs/react-aria-starter
	mv starters/docs/react-aria-starter.zip dist/production/docs/react-aria-starter.$$(git rev-parse --short HEAD).zip
	mv starters/tailwind/storybook-static dist/production/docs/react-aria-tailwind-starter
	mv starters/tailwind/react-aria-tailwind-starter.zip dist/production/docs/react-aria-tailwind-starter.$$(git rev-parse --short HEAD).zip

check-examples:
	node scripts/extractExamplesS2.mjs
	yarn tsc --project dist/docs-examples/tsconfig.json

starter:
	cd starters/docs && yarn --no-immutable && yarn up react-aria-components && yarn tsc

starter-zip: starter
	cp LICENSE starters/docs/.
	cd starters/docs && zip -r react-aria-starter.zip . -x .gitignore .DS_Store "node_modules/*" "storybook-static/*"
	cd starters/docs && yarn build-storybook

tailwind-starter:
	cp LICENSE starters/tailwind/.
	cd starters/tailwind && yarn --no-immutable && yarn up react-aria-components && yarn up tailwindcss-react-aria-components && yarn tsc

	cd starters/tailwind && zip -r react-aria-tailwind-starter.zip . -x .gitignore .DS_Store "node_modules/*" "storybook-static/*"
	cd starters/tailwind && yarn build-storybook

s2-storybook-docs:
	yarn build:s2-storybook-docs -o dist/production/docs/s2

s2-api-diff:
	node scripts/buildBranchAPI.js
	node scripts/api-diff.js --skip-same --skip-style-props

s2-docs:
	DOCS_ENV=stage PUBLIC_URL=/$(BRANCH_TYPE)/$(HASH) $(MAKE) build-s2-docs
	cp packages/dev/docs/pages/disallow-robots.txt dist/s2-docs/react-aria/$(BRANCH_TYPE)/$(HASH)/robots.txt
	cp packages/dev/docs/pages/disallow-robots.txt dist/s2-docs/s2/$(BRANCH_TYPE)/$(HASH)/robots.txt

s2-docs-stage:
	DOCS_ENV=stage PUBLIC_URL=/ $(MAKE) build-s2-docs
	cp packages/dev/docs/pages/disallow-robots.txt dist/s2-docs/react-aria/robots.txt
	cp packages/dev/docs/pages/disallow-robots.txt dist/s2-docs/s2/robots.txt

s2-docs-production:
	DOCS_ENV=prod PUBLIC_URL=/ $(MAKE) build-s2-docs
	cp packages/dev/docs/pages/robots.txt dist/s2-docs/react-aria/robots.txt
	cp packages/dev/docs/pages/robots.txt dist/s2-docs/s2/robots.txt
	cd starters/docs && yarn install --no-immutable && yarn up react-aria-components
	cd starters/tailwind && yarn install --no-immutable && yarn up react-aria-components tailwindcss-react-aria-components
	$(MAKE) build-starters

build-s2-docs:
	yarn workspace @react-spectrum/s2-docs generate:md
	yarn workspace @react-spectrum/s2-docs generate:og
	LIBRARY=react-aria node scripts/buildRegistry.mjs
	yarn build:s2-docs
	LIBRARY=react-aria node scripts/createFeedS2.mjs
	mkdir -p dist/s2-docs/react-aria/$(PUBLIC_URL)
	mkdir -p dist/s2-docs/s2/$(PUBLIC_URL)
	mv packages/dev/s2-docs/dist/react-aria/* dist/s2-docs/react-aria/$(PUBLIC_URL)
	mv packages/dev/s2-docs/dist/s2/* dist/s2-docs/s2/$(PUBLIC_URL)

	# Build old docs pages, which get inter-mixed with the new pages
	# TODO: We probably don't need to build this on every PR
	yarn parcel build 'packages/@react-spectrum/*/docs/*.mdx' 'packages/dev/docs/pages/{react-spectrum,releases}/**/*.mdx' --dist-dir dist/s2-docs/s2/$(PUBLIC_URL) --public-url $(PUBLIC_URL)
	yarn parcel build 'packages/@react-{aria,stately}/*/docs/*.mdx'  --dist-dir dist/s2-docs/react-aria/$(PUBLIC_URL) --public-url $(PUBLIC_URL)

build-starters:
	$(MAKE) starter-zip
	$(MAKE) tailwind-starter
	mkdir -p dist/s2-docs/react-aria/$(PUBLIC_URL)
	mv starters/docs/storybook-static dist/s2-docs/react-aria/$(PUBLIC_URL)/react-aria-starter
	mv starters/docs/react-aria-starter.zip dist/s2-docs/react-aria/$(PUBLIC_URL)/react-aria-starter.$$(git rev-parse --short HEAD).zip
	mv starters/tailwind/storybook-static dist/s2-docs/react-aria/$(PUBLIC_URL)/react-aria-tailwind-starter
	mv starters/tailwind/react-aria-tailwind-starter.zip dist/s2-docs/react-aria/$(PUBLIC_URL)/react-aria-tailwind-starter.$$(git rev-parse --short HEAD).zip
