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

import {ZmObjectHandler} from "../../zimbra/zimbraMail/share/model/ZmObjectHandler";
import {emojione, emojioneList, toImage} from "../../libext/emojione";

export class EmojiOneHandler extends ZmObjectHandler {

  private static DATE_TEST: RegExp = /(\d{1,2}:\d{1,2})/g;

  constructor() {
    super("EmojiOne");
  }

  public match(content: string, startIndex: number): RegExpExecArray {
    emojione.asciiRegexp.lastIndex = startIndex;
    emojione.unicodeRegexp.lastIndex = startIndex;
    emojione.shortnamesRegexp.lastIndex = startIndex;
    if (EmojiOneHandler.DATE_TEST.test(content)) {
      // Exclude dates to the emojify process
      return null;
    } else {
      let results = [];
      let snR: RegExpExecArray = emojione.shortnamesRegexp.exec(content);
      if (snR !== null) results.push(new MatchResult(emojione.shortnamesRegexp.lastIndex, snR, 1));
      let ucR: RegExpExecArray = emojione.unicodeRegexp.exec(content);
      if (ucR !== null) results.push(new MatchResult(emojione.unicodeRegexp.lastIndex, ucR, 3));
      let asciiR: RegExpExecArray = emojione.asciiRegexp.exec(content);
      if (asciiR !== null) results.push(new MatchResult(emojione.asciiRegexp.lastIndex, asciiR, 2));
      if (results.length > 0) {
        results.sort(EmojiOneHandler.sortResultsFcn);
        return results[0].getResult();
      } else {
        return null;
      }
    }
  }

  public generateSpan(html: string[], idx: number, obj: string, spanId?: string, context?: string, options?: {}): number {
    // emojione.setSprites(false);
    let imgDiv = toImage(obj);
    // emojione.setSprites(true);
    emojione.asciiRegexp.lastIndex = 0;
    let removeEmoji: string = "",
      match: RegExpExecArray | null = emojione.asciiRegexp.exec(obj);
    if (match !== null && match.index === 0) {
      removeEmoji = `style="cursor: pointer;" id="${spanId}"`;
    }
    html[idx] = imgDiv.replace("<span", `<span ${removeEmoji}`);
    idx += 1;
    return idx;
  }

  public clicked(spanElement: HTMLElement, contentObjText: string, matchContext?: any, canvas?: any): void {
    spanElement.parentNode.replaceChild(document.createTextNode(contentObjText), spanElement);
  }

  private static sortResultsFcn(a: MatchResult, b: MatchResult): number {
    if (a.hasResult() && b.hasResult()) {
      if (a.getPriority() < b.getPriority()) {
        return -1;
      } else if (a.getPriority() > b.getPriority()) {
        return 1;
      } else {
        return 0;
      }
    } else if (a.getResult() != null) {
      return -1;
    } else if (b.getResult() != null) {
      return 1;
    } else {
      return 0;
    }
  }

  // Don't change class on mouseover
  public getHoveredClassName(object: string, context: string, id: string): string {
    return document.getElementById(id).className;
  }

  public getClassName(object: string, context: string, id: string): string {
    return document.getElementById(id).className;
  }

  public getActiveClassName(object: string, context: string, id: string): string {
    return document.getElementById(id).className;
  }
}

class MatchResult {

  private mLastIndex: number;
  private mResult: RegExpExecArray;
  private mPriority: number;

  constructor(lastIndex: number, result: RegExpExecArray, priority: number = 999) {
    this.mLastIndex = lastIndex;
    this.mResult = result;
    this.mPriority = priority;
  }

  public getLastIndex(): number {
    return this.mLastIndex;
  }

  public getResult(): RegExpExecArray {
    return this.mResult;
  }

  public hasResult(): boolean {
    return (typeof this.mResult !== "undefined" && this.mResult !== null);
  }

  public getPriority(): number {
    return this.mPriority;
  }

}
