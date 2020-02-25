.PHONY: clean test lint build

SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)
NPM_REGISTRY=http://localhost:4873
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
	node lint-packages.js

test:
	yarn jest

ci-test: lint
	yarn jest --maxWorkers=2

storybook:
	NODE_ENV=storybook yarn build-storybook

deploy: storybook docs
	ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null $(SERVER) mkdir -p "~/rsp"
	scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -r documentation/public/* "$(SERVER):~/rsp/."
	scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -r public/* "$(SERVER):~/rsp/."

# for now doesn't have deploy since v3 doesn't have a place for docs and stuff yet
ci:
	$(MAKE) publish

publish: 
	lerna publish from-package --yes --registry $(NPM_REGISTRY)

build:
	parcel build packages/@react-{spectrum,aria,stately}/*/ --no-minify
