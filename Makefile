.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)
NPM_REGISTRY=http://localhost:4873/
SERVER=root@react-spectrum.corp.adobe.com

all: node_modules

node_modules: package.json
	yarn install
	touch $@

# using this won't generate icons and definitions, but will allow us to run things like cleaning beforehand
install_no_postinstall:
	NOYARNPOSTINSTALL=1 yarn install

# --ci keeps it from opening the browser tab automatically
run:
	NODE_ENV=storybook start-storybook -p 9003 --ci -c ".storybook-v3"

clean:
	yarn clean:icons
	rm -rf dist storybook-static storybook-static-v3 public src/dist
	$(MAKE) clean_docs

clean_all:
	$(MAKE) clean
	$(MAKE) clean_node_modules

clean_node_modules:
	$(MAKE) clean_project_node_modules
	$(MAKE) clean_docs_node_modules

clean_project_node_modules:
	rm -rf node_modules
	rm -rf packages/*/*/node_modules

# --prefix needs to come before the command that npm is to run, otherwise documentation seems to indicate that it will write node_modules to that location
docs:
	cd documentation && yarn --no-lockfile
	cd documentation && yarn build

docs_local:
	cd documentation && yarn --no-lockfile
	cd documentation && yarn develop

clean_docs:
	rm -rf documentation/public

# in order to pick up new changes to local components, this should be run before `docs_local` or `docs`
clean_docs_node_modules:
	rm -rf documentation/node_modules

lint:
	yarn check-types
	eslint packages --ext .js,.ts,.tsx

test:
	yarn jest

ci-test: lint test

storybook:
	yarn build-storybook

deploy: storybook docs
	ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null $(SERVER) mkdir -p "~/rsp"
	scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -r documentation/public/* "$(SERVER):~/rsp/."
	scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -r public/* "$(SERVER):~/rsp/."

ci-deploy:
	@if [ "$$VERSION" == "major" ] || [ "$$VERSION" == "minor" ] || [ "$$VERSION" == "patch" ] || [ "$$VERSION" == "website only" ]; then \
		$(MAKE) deploy; \
	fi

# for now doesn't have deploy since v3 doesn't have a place for docs and stuff yet
ci:
	$(MAKE) publish

# add back --contents dist or w/e once we finalize what we want this step to do
publish: build version
	lerna publish from-git --yes --registry $(NPM_REGISTRY)

build:
	lerna exec --parallel --ignore "@adobe/*" --no-private 'BUILD_ENV=production NODE_ENV=production babel --root-mode upward src --out-dir dist --extensions .ts,.tsx --no-comments'

# TODO add --yes to this once everything is finalized and remove --no-push
# For first publish go with hard coded 3.0.0. Will eventually replace with conventional commits version bump determination?
version:
	lerna version minor --no-commit-hooks -m "chore(release): publish" --no-push
