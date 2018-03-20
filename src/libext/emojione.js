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

var emojione = require("emojione");

function setAscii(enable) {
  emojione.ascii = enable;
}
function setSprites(enable) {
  emojione.sprites = enable;
}
function setUnicodeAlt(enable) {
  emojione.unicodeAlt = enable;
}
function setCacheBustParams(params) {
  emojione.cacheBustParam = params;
}
function setImagePath(path) {
  emojione.imagePathPNG = path + "images/emojione/png/";
  emojione.imagePathSVG = path + "images/emojione/svg/";
  emojione.imagePathSVGSprites = path + "images/emojione/emojione.sprites.svg";
}
function toImage(emoji) {
  return emojione.toImage(emoji);
}

var exports = {};
exports.emojione = {
  setAscii: setAscii,
  setSprites: setSprites,
  setUnicodeAlt: setUnicodeAlt,
  setCacheBustParams: setCacheBustParams,
  setImagePath: setImagePath,
  asciiRegexp: new RegExp(emojione.asciiRegexp, "g"),
  unicodeRegexp: new RegExp(emojione.unicodeRegexp, "g"),
  shortnamesRegexp: new RegExp(emojione.shortnames, "g"),
  emojioneList: emojione.emojioneList,
  asciiList: emojione.asciiList,
  jsEscapeMap: emojione.jsEscapeMap
};
exports.toImage = toImage;
exports.emojioneList = emojione.emojioneList;

module.exports = exports;
