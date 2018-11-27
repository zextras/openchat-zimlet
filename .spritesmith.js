/*
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

module.exports = [{
  src: './src/images/16/**/*.{png,gif,jpg}',
  destImage: './src/images/com_zextras_chat_open_sprite.png',
  destCSS: './src/images/com_zextras_chat_open_sprite.scss',
  imgPath: 'com_zextras_chat_open_sprite.png',
  padding: 0,
  algorithm: 'top-down',
  algorithmOpts: { sort: false },
  engine: 'pixelsmith',
  cssTemplate: "./src/images/com_zextras_chat_open_sprite.template.scss",
  cssOpts: {}
},{
  src: './build/images/emojione/16/png/*.png',
  destImage: './src/images/emojione.sprites_16.png',
  destCSS: './src/images/emojione.sprites_16.scss',
  imgPath: 'emojione.sprites_16.png',
  padding: 0,
  algorithm: 'top-down',
  algorithmOpts: { sort: false },
  engine: 'pixelsmith',
  cssTemplate: "./src/images/emojione.sprites.template_16.scss",
  cssOpts: {}
},
{
  src: './build/images/emojione/32/png/*.png',
  destImage: './src/images/emojione.sprites_32.png',
  destCSS: './src/images/emojione.sprites_32.scss',
  imgPath: 'emojione.sprites_32.png',
  padding: 0,
  algorithm: 'top-down',
  algorithmOpts: { sort: false },
  engine: 'pixelsmith',
  cssTemplate: "./src/images/emojione.sprites.template_32.scss",
  cssOpts: {}
}];
