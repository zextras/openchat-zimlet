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
VERSION = $(shell fgrep "\"version\":" package.json | sed -e 's/\s*"version":\s*"\([0-9]*\).*",/\1/')
DESCRIPTION = $(shell fgrep "\"description\":" package.json | sed -e 's/\s*"description":\s*"\(.*\)",/\1/')
NAME = $(shell fgrep "\"name\":" package.json | sed -e 's/\s*"name":\s*"\(.*\)",/\1/')
SPRITE_NAME = $(shell fgrep "\"name\":" package.json | sed -e 's/\s*"name":\s*"\(.*\)",/\1/')_sprite
LABEL = OpenChat Zimlet

ELECTRON_VERSION=v1.7.9
REACT_VERSION=development

all: dist/com_zextras_chat_open.zip

.PHONY: node_modules \
	clean \
	init \
	install \
	guard-%

node_modules:
	@ if [ ! -d "node_modules" ]; then npm install; fi

src/dwt/widgets/emoji/EmojiTemplate.ts:
	@ node utils/GenerateEmojiMenus.js > src/dwt/widgets/emoji/EmojiTemplate.ts
	# Updated EmojiTemplate.js

src/ZimletVersion.ts:
	@ rm -rf src/ZimletVersion.ts
	@ cp src/ZimletVersion.template.ts src/ZimletVersion.ts
	@ sed -i -e s/#COMMIT_DATA#/$(COMMIT_ID)/g \
			-e s/#VERSION#/$(VERSION)/g \
			-e s/#IS_STABLE#/true/g \
			-e s/#IS_STAGING#/false/g \
			-e s/#IS_TESTING#/false/g \
			-e s/#ZIMLET_NAME#/OpenChat/g \
			-e s/#PACKAGE_NAME#/com_zextras_chat_open/g \
		src/ZimletVersion.ts
	# Updated src/ZimletVersion.ts

src/images/com_zextras_chat_open_sprite.scss: node_modules
	# Build sprites (emojione and icons)
	@ mkdir -p build/images/emojione/png-fullsize
	@ mkdir -p build/images/emojione/16/png
	@ mkdir -p build/images/emojione/32/png
	@ cp `node utils/GenerateEmojiMenus.js -f` build/images/emojione/png-fullsize/
	@ ./node_modules/.bin/sharp resize 16 16 -i build/images/emojione/png-fullsize/* -o build/images/emojione/16/png > build/sharp_16.log
	@ ./node_modules/.bin/sharp resize 32 32 -i build/images/emojione/png-fullsize/* -o build/images/emojione/32/png > build/sharp_32.log
	@ ./node_modules/.bin/spritesmith
	@ rm -rf build/images/
	@ mv src/images/emojione.sprites_16.png src/images/emojione.sprites_16.uncompressed.png
	@ pngquant \
    		--speed 1 \
    		--nofs \
    		-o src/images/emojione.sprites_16.png \
    		src/images/emojione.sprites_16.uncompressed.png
	@ rm src/images/emojione.sprites_16.uncompressed.png
	@ mv src/images/emojione.sprites_32.png src/images/emojione.sprites_32.uncompressed.png
	@ pngquant \
    		--speed 1 \
    		--nofs \
    		-o src/images/emojione.sprites_32.png \
    		src/images/emojione.sprites_32.uncompressed.png
	@ rm src/images/emojione.sprites_32.uncompressed.png

build:
	@ mkdir -p build
	@ mkdir -p build/images

build/com_zextras_chat_open.xml:
	# Build the zimlet xml
	@ cp src/com_zextras_chat_open.template.xml build/com_zextras_chat_open.xml
	@ sed -i -e 's/#VERSION#/$(VERSION)/g' \
		-e 's/#NAME#/$(NAME)/g' \
		-e 's/#LABEL#/$(LABEL)/g' \
		-e 's/#DESCRIPTION#/$(DESCRIPTION)/g' \
		build/com_zextras_chat_open.xml

build/com_zextras_chat_open_bundle.js: node_modules \
									build/yuicompressor.jar \
									src/ZimletVersion.ts \
									src/images/com_zextras_chat_open_sprite.scss \
									src/dwt/widgets/emoji/EmojiTemplate.ts \
	# Check T4Z project if there are modifications
	@ cd src/zimbra && make check-exports
	# Create the JS bundle
	@ ./node_modules/.bin/webpack \
		--env.packageName com_zextras_chat_open \
		--config config/webpack.config-open.js
	# Test the bundle files against the YUI Compressor
	@ java -jar build/yuicompressor.jar \
		--type js \
		--nomunge \
		--preserve-semi \
		--disable-optimizations \
		build/com_zextras_chat_open_bundle.js \
		-o build/com_zextras_chat_open_bundle.min.js
	@ rm -f build/com_zextras_chat_open_bundle.min.js

build/com_zextras_chat_open.properties: build
	# Copy language files
	@ cp i18n/*.properties build/

build/desktop-chat_128.png: build
	@ cp src/images/desktop-chat_128.png build/

build/templates/Widgets.template: build
	# Copy templates
	@ cp -r src/templates build/

build/VERSION: build
    # Build VERSION file
	@ echo "$(VERSION)" >> build/VERSION
	@ echo "$(COMMIT_ID_LONG)" >> build/VERSION

build/LICENSE: build
	@ cp LICENSE build/

dist/com_zextras_chat_open.zip: init \
								build/com_zextras_chat_open.xml \
								build/com_zextras_chat_open_bundle.js \
								build/com_zextras_chat_open.properties \
								build/desktop-chat_128.png \
								build/templates/Widgets.template \
								build/VERSION \
								build/LICENSE
	# Create the ZIP file
	@ cd build && zip -q -r ../dist/com_zextras_chat_open.zip \
		templates/* \
		com_zextras_chat_open_bundle.js \
		com_zextras_chat_open_bundle.js.map \
		com_zextras_chat_open*.properties \
		com_zextras_chat_open.xml \
		com_zextras_chat_open_sprite.png \
		emojione.sprites*.png \
		desktop-chat_128.png \
		fa-* \
		OpenSans-* \
		VERSION \
		LICENSE

build/openchat-app-dev: build \
						src/ZimletVersion.ts \
						src/dwt/widgets/emoji/EmojiTemplate.ts
	mkdir -p build/openchat-app
	./node_modules/.bin/webpack --config config/webpack.config.app.js

clean:
	@ rm -rf \
		dist/com_zextras_chat_open.zip \
		src/ZimletVersion.ts \
		src/dwt/widgets/emoji/EmojiTemplate.ts \
		src/images/emojione.sprites_16.png \
		src/images/emojione.sprites_16.scss \
		src/images/emojione.sprites_32.png \
		src/images/emojione.sprites_32.scss \
		src/images/com_zextras_chat_open_sprite.png \
		src/images/com_zextras_chat_open_sprite.scss \
		build/templates/ \
		build/com_zextras_chat_open_bundle.js \
		build/com_zextras_chat_open_bundle.js.map \
		build/com_zextras_chat_open*.properties \
		build/com_zextras_chat_open.xml \
		build/com_zextras_chat_open_sprite.png \
		build/emojione.sprites*.png \
		build/desktop-chat_128.png \
		build/fa-* \
		build/OpenSans-* \
		build/VERSION \
		build/LICENSE \
		build/sharp*.log

init:
	@ mkdir -p build
	@ mkdir -p build/images
	@ mkdir -p dist

build/yuicompressor.jar: build
	# In Zimbra 8.6 is used `yuicompressor-2.4.2-zimbra.jar`, but We will use the latest.
	@ if [ ! -f build/yuicompressor.jar ]; then wget https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar -O build/yuicompressor.jar; fi

install: guard-ZIMLET_DEV_SERVER \
		dist/com_zextras_chat_open.zip
	# Deploy the zimlet on a server
	scp dist/com_zextras_chat_open.zip root@${ZIMLET_DEV_SERVER}:/tmp/
	ssh root@${ZIMLET_DEV_SERVER} "chown zimbra:zimbra /tmp/com_zextras_chat_open.zip"
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmzimletctl deploy /tmp/com_zextras_chat_open.zip'"
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmprov fc zimlet'"
	@ echo -n "Completed @ " && date

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
