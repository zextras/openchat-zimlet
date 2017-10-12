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

// tslint:disable-next-line:class-name
export declare class emojione {
  public static asciiRegexp: RegExp;
  public static unicodeRegexp: RegExp;
  public static shortnamesRegexp: RegExp;
  public static emojioneList: IEmojiOneList;
  public static asciiList: {[asciiCode: string]: string};
  public static jsEscapeMap: {[unicode: string]: string};

  public static setAscii(enable: boolean): void;
  public static setSprites(enable: boolean): void;
  public static setUnicodeAlt(enable: boolean): void;
  public static setCacheBustParams(params: {}|string): void;
  public static setImagePath(path: string): void;
  public static toImage(emoji: string): string;
}

export declare function toImage(emoji: string): string;

export declare const emojioneList: IEmojiOneList;
export interface IEmojiOneList {
  [shortName: string]: IEmojiOneListData;
}
export interface IEmojiOneListData {
  fname: string;
  uc: string;
  isCanonical: boolean;
  unicode: string[];
}
