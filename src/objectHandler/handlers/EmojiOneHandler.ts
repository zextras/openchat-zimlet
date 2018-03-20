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

import {emojione, toImage} from "../../libext/emojione";
import {ZmObjectHandler} from "../../zimbra/zimbraMail/share/model/ZmObjectHandler";

export class EmojiOneHandler extends ZmObjectHandler {

  private static DATE_TEST: RegExp = /(\d{1,2}:\d{1,2})/g;

  private static sortResultsFcn(a: MatchResult, b: MatchResult): number {
    if (a.hasResult() && b.hasResult()) {
      if (a.getLastIndex() < b.getLastIndex()) {
        if (a.getPriority() > b.getPriority()) {
          // checkNoIntersection
          if (a.getLastIndex() <= b.getLastIndex() - b.getResult()[0].length) {
            return -1;
          }   else {
            return 1;
          }
        } else {
          return -1;
        }
      } else if (a.getLastIndex() > b.getLastIndex()) {
        if (a.getPriority() < b.getPriority()) {
          if (a.getLastIndex() - a.getResult()[0].length >= b.getLastIndex()) {
            return 1;
          } else {
            return -1;
          }
        } else {
          return 1;
        }
      } else {
        if (a.getPriority() > b.getPriority()) {
          return 1;
        } else if (a.getPriority() < b.getPriority()) {
          return -1;
        } else {
          return 0;
        }
      }
    } else if (a.getResult() != null) {
      return -1;
    } else if (b.getResult() != null) {
      return 1;
    } else {
      return 0;
    }
  }

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
      const results = [];
      const snR: RegExpExecArray = emojione.shortnamesRegexp.exec(content);
      if (snR !== null) { results.push(new MatchResult(emojione.shortnamesRegexp.lastIndex, snR, 1)); }
      const ucR: RegExpExecArray = emojione.unicodeRegexp.exec(content);
      if (ucR !== null) { results.push(new MatchResult(emojione.unicodeRegexp.lastIndex, ucR, 3)); }
      const asciiR: RegExpExecArray = emojione.asciiRegexp.exec(content);
      if (asciiR !== null) { results.push(new MatchResult(emojione.asciiRegexp.lastIndex, asciiR, 2)); }
      if (results.length > 0) {
        results.sort(EmojiOneHandler.sortResultsFcn);
        return results[0].getResult();
      } else {
        return null;
      }
    }
  }

  public generateSpan(
    html: string[],
    idx: number,
    obj: string,
    spanId?: string,
    context?: string,
    options?: {},
  ): number {
    html[idx++] = toImage(obj)
      .replace(/emojione /g, "emojione_16 ")
      .replace(/$<span /, `<span id="${spanId}" `);
    return idx;
  }

  public clicked(spanElement: HTMLElement, contentObjText: string, matchContext?: any, canvas?: any): void {
    spanElement.parentNode.replaceChild(document.createTextNode(spanElement.getAttribute("title")), spanElement);
  }

  // Don't change class on mouseover
  public getHoveredClassName(object: string, context: string, id: string): string {
    const spanEl: HTMLElement = document.getElementById(id);
    return (typeof spanEl !== "undefined" && spanEl !== null) ? spanEl.className : "";
  }

  public getClassName(object: string, context: string, id: string): string {
    const spanEl: HTMLElement = document.getElementById(id);
    return (typeof spanEl !== "undefined" && spanEl !== null) ? spanEl.className : "";
  }

  public getActiveClassName(object: string, context: string, id: string): string {
    const spanEl: HTMLElement = document.getElementById(id);
    return (typeof spanEl !== "undefined" && spanEl !== null) ? spanEl.className : "";
  }
}

// tslint:disable-next-line:max-classes-per-file
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
