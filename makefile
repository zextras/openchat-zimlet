#
# Copyright (C) 2017 ZeXtras S.r.l.
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation, version 2 of
# the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License.
# If not, see <http://www.gnu.org/licenses/>.
#

COMMIT_ID = $(shell git rev-parse --short HEAD)
COMMIT_BRANCH = $(shell git rev-parse --abbrev-ref HEAD)
VERSION = $(shell fgrep "\"version\":" package.json | sed -e 's/\s*"version":\s*"\(.*\)",/\1/')
DESCRIPTION = $(shell fgrep "\"description\":" package.json | sed -e 's/\s*"description":\s*"\(.*\)",/\1/')
NAME = $(shell fgrep "\"name\":" package.json | sed -e 's/\s*"name":\s*"\(.*\)",/\1/')

all: dist/com_zextras_chat_open.zip

.PHONY: check-yui clean init install guard-%

node_modules:
	if [ ! -d "node_modules" ]; then npm install; fi

src/ZimletVersion.ts:
	# Build the zimlet version file
	cp src/ZimletVersion.template.ts src/ZimletVersion.ts
	sed -i s/#COMMIT_DATA#/$(COMMIT_BRANCH)-$(COMMIT_ID)/g src/ZimletVersion.ts
	sed -i s/#VERSION#/$(VERSION)/g src/ZimletVersion.ts

src/emojione.sprites.css: node_modules
	# Build sprites (emojione and icons)
	mkdir -p build/tmp
	./node_modules/.bin/sharp resize 16 16 -i node_modules/emojione/assets/png/* -o build/tmp
	./node_modules/.bin/spritesmith
	rm -rf build/tmp

build/com_zextras_chat_open.css: node_modules src/emojione.sprites.css
	# Build the CSS and copy the images
	mkdir -p build/images/
	cp src/images/*.png build/images/
	./node_modules/.bin/npm-sass src/com_zextras_chat_open.sass > build/com_zextras_chat_open.css
	cp src/emojione.sprites.css build/

build/com_zextras_chat_open.xml:
	# Build the zimlet xml
	cp src/com_zextras_chat_open.template.xml build/com_zextras_chat_open.xml
	sed -i -e 's/#VERSION#/$(VERSION)/g' \
		-e 's/#NAME#/$(NAME)/g' \
		-e 's/#DESCRIPTION#/$(DESCRIPTION)/g' \
		build/com_zextras_chat_open.xml

build/com_zextras_chat_open_bundle.js: node_modules src/ZimletVersion.ts
	# Check T4Z project if there are modifications
	cd src/zimbra && make check-exports
	# Lint the files
	./node_modules/.bin/tslint -c tslint.json --project tsconfig.json
	./node_modules/.bin/coffeelint src/
	# Create the JS bundle
	./node_modules/.bin/webpack --config webpack.config-open.js

build/com_zextras_chat_open.properties:
	# Copy language files
	cp src/i18n/*.properties build/

build/templates:
	# Copy templates
	cp -r src/templates build/

dist/com_zextras_chat_open.zip: init build/com_zextras_chat_open.xml build/com_zextras_chat_open.css build/com_zextras_chat_open_bundle.js build/com_zextras_chat_open.properties build/templates
	# Create the zip file
	rm -f dist/com_zextras_chat_open.zip
	cd build && zip -q -r ../dist/com_zextras_chat_open.zip \
		templates \
		images \
		com_zextras_chat_open.properties \
		com_zextras_chat_open*.properties \
		com_zextras_chat_open.xml \
		com_zextras_chat_open.css \
		emojione.sprites.css \
		com_zextras_chat_open_bundle.js

clean:
	# Version file
	rm -f src/ZimletVersion.ts
	# Assets
	rm -f src/images/emojione.sprites.png
	rm -f src/emojione.sprites.css
	rm -f build/emojione.sprites.css
	rm -f src/images/com_zextras_chat_open_sprite.png
	rm -f src/images/com_zextras_chat_open_sprite.sass
	rm -rf build/images
	rm -rf build/templates
	# Language files
	rm -f build/com_zextras_chat_open.properties
	rm -f build/com_zextras_chat_open*.properties
	# Zimlet files
	rm -f build/com_zextras_chat_open.css
	rm -f build/com_zextras_chat_open.xml
	rm -f build/com_zextras_chat_open_bundle.js
	# Final package
	rm -f dist/com_zextras_chat_open.zip

init:
	mkdir -p build
	mkdir -p build/images
	mkdir -p dist

build/yuicompressor.jar:
	rm -f build/yuicompressor.jar
	wget https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar -O build/yuicompressor.jar

check-yui: build/yuicompressor.jar build/com_zextras_chat_open_bundle.js
	java -jar build/yuicompressor.jar --type js --nomunge --preserve-semi --disable-optimizations build/com_zextras_chat_open_bundle.js -o build/com_zextras_chat_open_bundle.min.js
	rm -f build/com_zextras_chat_open_bundle.min.js

install: guard-ZIMLET_DEV_SERVER check-yui dist/com_zextras_chat_open.zip
	# Deploy the zimlet on a server
	scp dist/com_zextras_chat_open.zip root@${ZIMLET_DEV_SERVER}:/tmp/
	ssh root@${ZIMLET_DEV_SERVER} "chown zimbra:zimbra /tmp/com_zextras_chat_open.zip"
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmzimletctl deploy /tmp/com_zextras_chat_open.zip'"
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmprov fc zimlet'"

guard-%:
	# Verify if an environment variable is set
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi
