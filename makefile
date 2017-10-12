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
COMMIT_ID_LONG = $(shell git rev-parse HEAD)
VERSION = $(shell fgrep "\"version\":" package.json | sed -e 's/\s*"version":\s*"\(.*\)",/\1/')
DESCRIPTION = $(shell fgrep "\"description\":" package.json | sed -e 's/\s*"description":\s*"\(.*\)",/\1/')
NAME = $(shell fgrep "\"name\":" package.json | sed -e 's/\s*"name":\s*"\(.*\)",/\1/')
SPRITE_NAME = $(shell fgrep "\"name\":" package.json | sed -e 's/\s*"name":\s*"\(.*\)",/\1/')_sprite
LABEL = OpenChat Zimlet

all: dist/com_zextras_chat_open.zip

.PHONY: check-yui lint node_modules clean init install guard-%

lint:
	npm run lint

node_modules:
	if [ ! -d "node_modules" ]; then npm install; fi
	npm update
	./utils/patchNodeModules

src/dwt/widgets/emoji/EmojiTemplate.ts:
	node utils/GenerateEmojiMenus.js > src/dwt/widgets/emoji/EmojiTemplate.ts

src/ZimletVersion.ts:
	# Build the zimlet version file
	cp src/ZimletVersion.template.ts src/ZimletVersion.ts
	sed -i -e s/#COMMIT_DATA#/$(COMMIT_ID)/g \
			-e s/#VERSION#/$(VERSION)/g \
			-e s/#IS_STABLE#/true/g \
			-e s/#IS_STAGING#/false/g \
			-e s/#IS_TESTING#/false/g \
			-e s/#ZIMLET_NAME#/OpenChat/g \
			-e s/#PACKAGE_NAME#/com_zextras_chat_open/g \
		src/ZimletVersion.ts

src/emojione.sprites.css: node_modules
	# Build sprites (emojione and icons)
	mkdir -p build/images/emojione/png-fullsize
	mkdir -p build/images/emojione/png
	cp `node utils/GenerateEmojiMenus.js -f` build/images/emojione/png-fullsize/
	./node_modules/.bin/sharp resize 16 16 -i build/images/emojione/png-fullsize/* -o build/images/emojione/png
	./node_modules/.bin/spritesmith
	rm -rf build/images/emojione

build/com_zextras_chat_open.css: node_modules \
								src/emojione.sprites.css
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
		-e 's/#LABEL#/$(LABEL)/g' \
		-e 's/#DESCRIPTION#/$(DESCRIPTION)/g' \
		build/com_zextras_chat_open.xml

build/com_zextras_chat_open_bundle.js: node_modules \
									src/ZimletVersion.ts \
									src/dwt/widgets/emoji/EmojiTemplate.ts
	# Check T4Z project if there are modifications
	cd src/zimbra && make check-exports
	# Lint the files
	./node_modules/.bin/tslint -c tslint.old.json --project tsconfig.json
	# Create the JS bundle
	./node_modules/.bin/webpack --config webpack.config-open.js

build/com_zextras_chat_open.properties:
	# Copy language files
	mkdir -p build
	cp i18n/*.properties build/

build/templates:
	# Copy templates
	mkdir -p build
	cp -r src/templates build/

build/VERSION:
	mkdir -p build
	echo "$(VERSION)" >> build/VERSION
	echo "$(COMMIT_ID_LONG)" >> build/VERSION

dist/com_zextras_chat_open.zip: init \
								build/com_zextras_chat_open.xml \
								build/com_zextras_chat_open.css \
								build/com_zextras_chat_open_bundle.js \
								build/com_zextras_chat_open.properties \
								build/templates \
								build/com_zextras_chat_open.properties \
								build/VERSION
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
		com_zextras_chat_open_bundle.js \
		com_zextras_chat_open_bundle.js.map \
		VERSION
	zip -u dist/com_zextras_chat_open.zip \
		LICENSE

clean:
	rm -f src/ZimletVersion.ts \
		src/dwt/widgets/emoji/EmojiTemplate.ts \
		src/images/emojione.sprites.png \
		src/emojione.sprites.css \
		build/emojione.sprites.css \
		src/images/com_zextras_chat_open_sprite.png \
		src/images/com_zextras_chat_open_sprite.sass \
		build/com_zextras_chat_open.properties \
		build/com_zextras_chat_open*.properties \
		build/com_zextras_chat_open.css \
        build/com_zextras_chat_open.xml \
        build/com_zextras_chat_open_bundle.js \
        build/com_zextras_chat_open_bundle.js.map \
        build/VERSION \
        dist/com_zextras_chat_open.zip \
	rm -rf build/images \
		build/templates

init:
	mkdir -p build
	mkdir -p build/images
	mkdir -p dist

build/yuicompressor.jar:
	# In Zimbra 8.6 is used `yuicompressor-2.4.2-zimbra.jar`, but We will use the latest.
	rm -f build/yuicompressor.jar
	wget https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar -O build/yuicompressor.jar

check-yui: build/yuicompressor.jar \
		build/com_zextras_chat_open_bundle.js
	# Test the bundle file against the YUI Compressor
	java -jar build/yuicompressor.jar \
		--type js \
		--nomunge \
		--preserve-semi \
		--disable-optimizations \
		build/com_zextras_chat_open_bundle.js \
		-o build/com_zextras_chat_open_bundle.min.js
	rm -f build/com_zextras_chat_open_bundle.min.js

install: guard-ZIMLET_DEV_SERVER \
		check-yui dist/com_zextras_chat_open.zip
	# Deploy the zimlet on a server
	scp dist/com_zextras_chat_open.zip root@${ZIMLET_DEV_SERVER}:/tmp/
	ssh root@${ZIMLET_DEV_SERVER} "chown zimbra:zimbra /tmp/com_zextras_chat_open.zip"
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmzimletctl deploy /tmp/com_zextras_chat_open.zip'"
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmprov fc zimlet'"
	echo -n "Completed @ " && date

push-translations:
	zanata-cli push

pull-translations:
	zanata-cli -B pull
	mv i18n/com_zextras_chat_open_en_US.properties i18n/com_zextras_chat_open.properties

guard-%:
	# Verify if an environment variable is set
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi
