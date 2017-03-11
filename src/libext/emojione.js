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

define([
  "require",
  "exports",
  "../zimbra/ajax/boot/AjxEnv",
  "emojione"
  ],
  function (
    require,
    exports,
    AjxEnv_1,
    emojione_1
  ) {
    var AjxEnv = AjxEnv_1.AjxEnv;

    function setAscii(enable) {
      emojione_1.ascii = enable;
    }
    function setSprites(enable) {
      emojione_1.sprites = enable;
    }
    function setUnicodeAlt(enable) {
      emojione_1.unicodeAlt = enable;
    }
    function setCacheBustParams(params) {
      emojione_1.cacheBustParam = params;
    }
    function setImagePath(path) {
      emojione_1.imagePathPNG = path + "images/emojione/png/";
      emojione_1.imagePathSVG = path + "images/emojione/svg/";
      emojione_1.imagePathSVGSprites = path + "images/emojione/emojione.sprites.svg";
    }
    function toImage(emoji) {
      return emojione_1.toImage(emoji);
    }

    exports.emojione = {
      setAscii: setAscii,
      setSprites: setSprites,
      setUnicodeAlt: setUnicodeAlt,
      setCacheBustParams: setCacheBustParams,
      setImagePath: setImagePath,
      asciiRegexp: new RegExp(emojione_1.asciiRegexp, "g"),
      unicodeRegexp: new RegExp(emojione_1.unicodeRegexp, "g"),
      shortnamesRegexp: new RegExp(emojione_1.shortnames, "g"),
      emojioneList: emojione_1.emojioneList
    };
    exports.toImage = toImage;
    exports.emojioneList = emojione_1.emojioneList;
  }
);
