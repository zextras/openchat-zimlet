#!/usr/bin/env node
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

var emojione = require('emojione');
var emoji_map = require("../node_modules/emojione/emoji.json");
var toneReg = /_tone([0-9]+):$/;
var emoji_path = "./node_modules/emojione/assets/png/";

var onlyFileNames = false;

process.argv.forEach(function (val, index, array) {
  if (val === "-f") {
    onlyFileNames = true;
  }
});

// Extract emoji pages:
var emojiCategories = {};
var emojiName, emojiCode;
for (emojiName in emoji_map) {
  if (!emoji_map.hasOwnProperty(emojiName)) { continue; }
  var emojiData = emoji_map[emojiName];

  if (!emojiCategories.hasOwnProperty(emojiData.category)) {
    emojiCategories[emojiData.category] = [];
  }
  emojiCategories[emojiData.category].push(emojiData);
}

var emojiSortFcn = function(a, b) {
  return parseInt(a.emoji_order, 10) - parseInt(b.emoji_order, 10);
};
var emojiCategory;
for (emojiCategory in emojiCategories) {
  if (!emojiCategories.hasOwnProperty(emojiCategory)) { continue; }
  emojiCategories[emojiCategory].sort(emojiSortFcn);
}

var getCategory = function(name) {
  if (!emojiCategories.hasOwnProperty(name)) { return []; }
  var categoryContent = emojiCategories[name],
    toRet = [];

  for (var i = 0; i < categoryContent.length; i += 1) {
    if (toneReg.test(categoryContent[i].shortname)) {
      // Skipping all the tones except the first, waiting for a tone selector
      // var regResult = parseInt(toneReg.exec(categoryContent[i].shortname)[1], 10);
      // if (regResult === 1) {
      //   toRet.push(categoryContent[i].shortname);
      // }
    } else {
      toRet.push({shortname: categoryContent[i].shortname, unicode: categoryContent[i].unicode});
    }
  }
  return toRet;
};

var EMOJI_PAGES = {
  ":grinning:": getCategory("people"),
  ":deciduous_tree:": getCategory("nature"),
  ":hamburger:": getCategory("food"),
  ":runner:": getCategory("activity"),
  ":oncoming_automobile:": getCategory("travel"),
  ":bulb:": getCategory("objects"),
  ":symbols:": getCategory("symbols"),
  ":flags:": getCategory("flags")
};

emojione.cacheBustParam = "";
emojione.imagePathPNG = '#imagePathPNG#';
emojione.imagePathSVG = '#imagePathSVG#';
emojione.imagePathSVGSprites = "#imagePathSVGSprites#emojione.sprites.svg";

var toRet = [],
  toRetOnlyFileNames = [],
  pageNames = [],
  pageNamesDataSprite = [],
  emojiCount = 0,
  pageName,
  page,
  i;


toRet.push('/*');
toRet.push(' * Copyright (C) 2017 ZeXtras S.r.l.');
toRet.push(' *');
toRet.push(' * This program is free software; you can redistribute it and/or');
toRet.push(' * modify it under the terms of the GNU General Public License');
toRet.push(' * as published by the Free Software Foundation, version 2 of');
toRet.push(' * the License.');
toRet.push(' *');
toRet.push(' * This program is distributed in the hope that it will be useful,');
toRet.push(' * but WITHOUT ANY WARRANTY; without even the implied warranty of');
toRet.push(' * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the');
toRet.push(' * GNU General Public License for more details.');
toRet.push(' *');
toRet.push(' * You should have received a copy of the GNU General Public License.');
toRet.push(' * If not, see <http://www.gnu.org/licenses/>.');
toRet.push(' */');
toRet.push('');
toRet.push('//');
toRet.push('// ! DO NOT EDIT THIS FILE !');
toRet.push('//');
toRet.push('// tslint:disable:max-line-length');
toRet.push('// Available categories:');
for (emojiCategory in emojiCategories) {
  if (!emojiCategories.hasOwnProperty(emojiCategory)) { continue; }
  toRet.push('// - ' + emojiCategory);
}

toRet.push('');
toRet.push('export class EmojiTemplate {');
toRet.push('');

emojione.sprites = true;
toRet.push('  public static DATA_SPRITES: IEmojiData[][] = [');
for (pageName in EMOJI_PAGES) {
  if (!EMOJI_PAGES.hasOwnProperty(pageName)) continue;
  page = EMOJI_PAGES[pageName];
  pageNames.push('"' + pageName + '"');
  pageNamesDataSprite.push('"' + emojione.shortnameToImage(pageName).replace(/"/g, '\'').replace(/>[^<]+</, '>' + emojiName + '<') + '"');
  toRet.push('    [');
  for (i = 0; i < page.length; i++) {
    ++emojiCount;
    emojiName = page[i].shortname;
    emojiCode = page[i].unicode;
    toRet.push('      { name: "' + emojiName + '", data: "' + emojione.shortnameToImage(emojiName).replace(/"/g, '\'').replace(/>[^<]+</, '>' + emojiName + '<') + '" },');
    toRetOnlyFileNames.push(emoji_path + emojiCode + ".png");
  }
  toRet.push('    ],');
}
toRet.pop();
toRet.push('    ],');
toRet.push('  ];');
toRet.push('');
toRet.push('  public static NAMES: string[] = [' + pageNames.join(', ') + '];');
toRet.push('');
toRet.push('  public static NAMES_DATA_SPRITE: string[] = [' + pageNamesDataSprite.join(', ') + '];');
toRet.push('}');
toRet.push('// Rendered ' + emojiCount + ' emoji!');

toRet.push('');
toRet.push('export interface IEmojiData {');
toRet.push('  name: string;');
toRet.push('  data: string;');
toRet.push('}');

if (onlyFileNames) {
  console.log(toRetOnlyFileNames.join('\n'));
}
else {
  console.log(toRet.join('\n'));
}
