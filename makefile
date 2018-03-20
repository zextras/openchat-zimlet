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

.PHONY: check-yui lint node_modules clean init install guard-%

lint: node_modules \
		src/ZimletVersion.ts \
		src/dwt/widgets/emoji/EmojiTemplate.ts
	npm run lint
	rm -rf src/ZimletVersion.ts

node_modules:
	if [ ! -d "node_modules" ]; then npm install; fi

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

src/images/emojione.sprites_16.scss: node_modules
	# Build sprites (emojione and icons)
	mkdir -p build/images/emojione/png-fullsize
	mkdir -p build/images/emojione/16/png
	mkdir -p build/images/emojione/32/png
	cp `node utils/GenerateEmojiMenus.js -f` build/images/emojione/png-fullsize/
	./node_modules/.bin/sharp resize 16 16 -i build/images/emojione/png-fullsize/* -o build/images/emojione/16/png > build/sharp_16.log
	./node_modules/.bin/sharp resize 32 32 -i build/images/emojione/png-fullsize/* -o build/images/emojione/32/png > build/sharp_32.log
	./node_modules/.bin/spritesmith
	rm -rf build/images/emojione

src/images/emojione.sprites_32.scss: src/images/emojione.sprites_16.scss
src/images/emojione.sprites_16.png: src/images/emojione.sprites_16.scss
src/images/emojione.sprites_32.png: src/images/emojione.sprites_16.scss
src/images/com_zextras_chat_open_sprite.scss: src/images/emojione.sprites_16.scss
src/images/com_zextras_chat_open_sprite.png: src/images/emojione.sprites_16.scss

build:
	mkdir -p build
	mkdir -p build/images

build/com_zextras_chat_open.xml:
	# Build the zimlet xml
	cp src/com_zextras_chat_open.template.xml build/com_zextras_chat_open.xml
	sed -i -e 's/#VERSION#/$(VERSION)/g' \
		-e 's/#NAME#/$(NAME)/g' \
		-e 's/#LABEL#/$(LABEL)/g' \
		-e 's/#DESCRIPTION#/$(DESCRIPTION)/g' \
		build/com_zextras_chat_open.xml

build/com_zextras_chat_open_bundle.js: node_modules \
									src/images/emojione.sprites_16.scss \
									src/images/emojione.sprites_32.scss \
									src/ZimletVersion.ts \
									src/dwt/widgets/emoji/EmojiTemplate.ts
	# Check T4Z project if there are modifications
	cd src/zimbra && make check-exports
	# Lint the files
	make lint
	make src/ZimletVersion.ts
	# Create the JS bundle
	./node_modules/.bin/webpack \
		--env.packageName com_zextras_chat_open \
		--config config/webpack.config-open.js
	rm -rf openchat-zimlet/src/ZimletVersion.ts

build/com_zextras_chat_open.properties: build
	# Copy language files
	cp i18n/*.properties build/

build/images/desktop-chat_128.png: build
	cp src/images/desktop-chat_128.png build/images/

build/templates: build
	# Copy templates
	cp -r src/templates build/

build/VERSION: build
	echo "$(VERSION)" >> build/VERSION
	echo "$(COMMIT_ID_LONG)" >> build/VERSION

build/images/emojione.sprites_16.png: build src/images/emojione.sprites_16.png
	pngquant \
		--speed 1 \
		--nofs \
		-o build/images/emojione.sprites_16.png \
		src/images/emojione.sprites_16.png

build/images/emojione.sprites_32.png: build src/images/emojione.sprites_32.png
	pngquant \
		--speed 1 \
		--nofs \
		-o build/images/emojione.sprites_32.png \
		src/images/emojione.sprites_32.png

build/images/com_zextras_chat_open_sprite.png: build src/images/com_zextras_chat_open_sprite.png
	cp src/images/com_zextras_chat_open_sprite.png build/images/

build/OpenSans-Regular-webfont.eot:
	cp src/app/opensans/OpenSans-Regular-webfont.eot build/

build/OpenSans-Regular-webfont.woff:
	cp src/app/opensans/OpenSans-Regular-webfont.woff build/

build/OpenSans-Regular-webfont.ttf:
	cp src/app/opensans/OpenSans-Regular-webfont.ttf build/

build/OpenSans-Regular-webfont.svg:
	cp src/app/opensans/OpenSans-Regular-webfont.svg build/

build/OpenSans-Semibold-webfont.eot:
	cp src/app/opensans/OpenSans-Semibold-webfont.eot build/

build/OpenSans-Semibold-webfont.woff:
	cp src/app/opensans/OpenSans-Semibold-webfont.woff build/

build/OpenSans-Semibold-webfont.ttf:
	cp src/app/opensans/OpenSans-Semibold-webfont.ttf build/

build/OpenSans-Semibold-webfont.svg:
	cp src/app/opensans/OpenSans-Semibold-webfont.svg build/

build/OpenSans-Bold-webfont.eot:
	cp src/app/opensans/OpenSans-Bold-webfont.eot build/

build/OpenSans-Bold-webfont.woff:
	cp src/app/opensans/OpenSans-Bold-webfont.woff build/

build/OpenSans-Bold-webfont.ttf:
	cp src/app/opensans/OpenSans-Bold-webfont.ttf build/

build/OpenSans-Bold-webfont.svg:
	cp src/app/opensans/OpenSans-Bold-webfont.svg build/

build/fa-solid-900.eot:
	cp src/app/fontawesome/fa-solid-900* build/

dist/com_zextras_chat_open.zip: init \
								build/images/emojione.sprites_16.png \
								build/images/emojione.sprites_32.png \
								build/images/com_zextras_chat_open_sprite.png \
								build/com_zextras_chat_open.xml \
								build/com_zextras_chat_open_bundle.js \
								build/com_zextras_chat_open.properties \
								build/images/desktop-chat_128.png \
								build/templates \
								build/VERSION \
								build/OpenSans-Regular-webfont.eot \
								build/OpenSans-Regular-webfont.woff \
								build/OpenSans-Regular-webfont.ttf \
								build/OpenSans-Regular-webfont.svg \
								build/OpenSans-Semibold-webfont.eot \
								build/OpenSans-Semibold-webfont.woff \
								build/OpenSans-Semibold-webfont.ttf \
								build/OpenSans-Semibold-webfont.svg \
								build/OpenSans-Bold-webfont.eot \
								build/OpenSans-Bold-webfont.woff \
								build/OpenSans-Bold-webfont.ttf \
								build/OpenSans-Bold-webfont.svg \
								build/fa-solid-900.eot
	# Create the zip file
	rm -f dist/com_zextras_chat_open.zip
	cd build && zip -q -r ../dist/com_zextras_chat_open.zip \
		templates/ \
		images/ \
		com_zextras_chat_open.properties \
		com_zextras_chat_open*.properties \
		com_zextras_chat_open.xml \
		com_zextras_chat_open_bundle.js \
		com_zextras_chat_open_bundle.js.map \
		com_zextras_chat_open_bundle.css \
		com_zextras_chat_open_bundle.css.map \
		OpenSans-Regular-webfont.eot \
		OpenSans-Regular-webfont.woff \
		OpenSans-Regular-webfont.ttf \
		OpenSans-Regular-webfont.svg \
		OpenSans-Semibold-webfont.eot \
		OpenSans-Semibold-webfont.woff \
		OpenSans-Semibold-webfont.ttf \
		OpenSans-Semibold-webfont.svg \
		OpenSans-Bold-webfont.eot \
		OpenSans-Bold-webfont.woff \
		OpenSans-Bold-webfont.ttf \
		OpenSans-Bold-webfont.svg \
		fa-solid-900.* \
		VERSION
	zip -u dist/com_zextras_chat_open.zip \
		LICENSE

build/openchat-app-dev: build \
						src/ZimletVersion.ts \
						src/dwt/widgets/emoji/EmojiTemplate.ts
	mkdir -p build/openchat-app
	./node_modules/.bin/webpack --config config/webpack.config.app.js
	src/ZimletVersion.ts

build/electron-linux-x64.zip: build
	wget -N https://github.com/electron/electron/releases/download/${ELECTRON_VERSION}/electron-${ELECTRON_VERSION}-linux-x64.zip \
		-O build/electron-linux-x64.zip

build/openchat-app.asar: build \
						src/ZimletVersion.ts \
						src/dwt/widgets/emoji/EmojiTemplate.ts
	mkdir -p build/openchat-app
	node utils/build-app.js
	cp src/app/main.js build/openchat-app/main.js
	cp src/app/package.json.template build/openchat-app/package.json
	sed -i -e 's/#VERSION#/$(VERSION)/g' \
    		-e 's/#NAME#/$(NAME)/g' \
    		build/openchat-app/package.json
	cd build/ && ../node_modules/.bin/asar pack openchat-app openchat-app.asar
	src/ZimletVersion.ts

build/openchat-app-linux-x64.tar.gz: build \
									build/openchat-app.asar \
									build/electron-linux-x64.zip
	mkdir -p build/openchat-app-linux-x64
	unzip -o build/electron-linux-x64.zip -d build/openchat-app-linux-x64
	cp build/openchat-app.asar build/openchat-app-linux-x64/
	cp src/app/openchat-linux build/openchat-app-linux-x64/
	cd build && tar -cvzf openchat-app-linux-x64.tar.gz \
		--owner=0 --group=0 \
		openchat-app-linux-x64/

dist/openchat-app-linux-x64.tar.gz: dist build/openchat-app-linux-x64.tar.gz
	cp build/openchat-app-linux-x64.tar.gz dist/

clean:
	rm -rf src/ZimletVersion.ts \
		src/dwt/widgets/emoji/EmojiTemplate.ts \
		src/images/emojione.sprites_16.png \
		src/images/emojione.sprites_16.scss \
		src/images/emojione.sprites_32.png \
		src/images/emojione.sprites_32.scss \
		src/images/com_zextras_chat_open_sprite.png \
		src/images/com_zextras_chat_open_sprite.scss \
		build/com_zextras_chat_open.properties \
		build/com_zextras_chat_open*.properties \
        build/com_zextras_chat_open.xml \
        build/com_zextras_chat_open_bundle.js \
        build/com_zextras_chat_open_bundle.js.map \
		build/com_zextras_chat_open_bundle.css \
		build/com_zextras_chat_open_bundle.css.map \
        build/VERSION \
        build/openchat-app.asar \
        build/openchat-app \
        build/openchat-app-dev \
        build/openchat-app-* \
        build/openchat-app-linux-x64.tar.gz \
        dist/com_zextras_chat_open.zip \
		build/images \
		build/templates \
		build/OpenSans-Regular-webfont.eot \
		build/OpenSans-Regular-webfont.woff \
		build/OpenSans-Regular-webfont.ttf \
		build/OpenSans-Regular-webfont.svg \
		build/OpenSans-Semibold-webfont.eot \
		build/OpenSans-Semibold-webfont.woff \
		build/OpenSans-Semibold-webfont.ttf \
		build/OpenSans-Semibold-webfont.svg \
		build/OpenSans-Bold-webfont.eot \
		build/OpenSans-Bold-webfont.woff \
		build/OpenSans-Bold-webfont.ttf \
		build/OpenSans-Bold-webfont.svg \
		build/fa-solid-900.eot

init:
	mkdir -p build
	mkdir -p build/images
	mkdir -p dist

build/yuicompressor.jar: build
	# In Zimbra 8.6 is used `yuicompressor-2.4.2-zimbra.jar`, but We will use the latest.
	rm -f build/yuicompressor.jar
	wget https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar \
		-O build/yuicompressor.jar

check-yui: build/yuicompressor.jar \
		build/com_zextras_chat_open_bundle.js
	# Test the bundle files against the YUI Compressor
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
