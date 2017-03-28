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

var util = require('util');

module.exports = [{
  src: './src/images/16/**/*.{png,gif,jpg}',
  destImage: './src/images/com_zextras_chat_open_sprite.png',
  destCSS: './src/images/com_zextras_chat_open_sprite.sass',
  imgPath: 'images/com_zextras_chat_open_sprite.png',
  padding: 0,
  algorithm: 'top-down',
  algorithmOpts: { sort: false },
  engine: 'pixelsmith',
  cssTemplate: "./src/images/com_zextras_chat_open_sprite.template.sass",
  cssOpts: {}
},{
  src: './build/images/emojione/png/*.{png,gif,jpg}',
  destImage: './src/images/emojione.sprites.png',
  destCSS: './src/emojione.sprites.css',
  imgPath: 'images/emojione.sprites.png',
  padding: 0,
  algorithm: 'top-down',
  algorithmOpts: { sort: false },
  engine: 'pixelsmith',
  cssTemplate: "./src/emojione.sprites.template.css",
  cssOpts: {}
}];
