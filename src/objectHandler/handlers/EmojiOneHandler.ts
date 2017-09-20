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
import {emojione} from "../../libext/emojione";
import {ZimletVersion} from "../../ZimletVersion";

export class EmojiOneHandler extends ZmObjectHandler {

  private static DATE_TEST: RegExp = /(\d{1,2}:\d{1,2})/g;
  private mEmojiPositionMap: {[code: string]: number};

  constructor() {
    super("EmojiOne");
    this.mEmojiPositionMap = {};
    let emojiStyleSheet: CSSStyleSheet;
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (typeof document.styleSheets[i].href !== "undefined" && document.styleSheets[i].href.indexOf("emojione.sprites.css") !== -1) {
        emojiStyleSheet = <CSSStyleSheet> document.styleSheets[i];
        break;
      }
    }
    // populate map
    for (let i = 0; i < emojiStyleSheet.cssRules.length; i++) {
      let cssText: string = emojiStyleSheet.cssRules[i].cssText;
      if (cssText.indexOf("background-position") !== -1 ) {
        // example cssText: ".emojione-0030-20e3 { background-image: url("images/emojione.sprites.png"); background-position: 0px -32px; width: 16px; height: 16px; }"
        // 26 = "background-position: 0px -".length; 10 = ".emojione-".length
        let startingIndex: number = cssText.indexOf("background-position") + 26;
        this.mEmojiPositionMap[cssText.substring(10, cssText.indexOf(" "))] = parseInt(cssText.substring(startingIndex, startingIndex + cssText.substring(startingIndex).indexOf("px")), 10);
      }
    }
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
      if (ucR !== null) results.push(new MatchResult(emojione.unicodeRegexp.lastIndex, ucR, 2));
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
    let converted: string = emojione.asciiList[obj] || emojione.jsEscapeMap[obj] || emojione.emojioneList[obj].unicode[emojione.emojioneList[obj].unicode.length - 1];
    let calculatedStyle: string = `height: 16px;` +
       `width: 16px;` +
       `min-height: 16px;` +
       `min-width: 16px;` +
       `display: inline-block;` +
       `position: relative;` +
       `vertical-align: middle;` +
       `line-height: normal;` +
       `font-size: inherit;` +
       `background-image: url("/service/zimlet/${ZimletVersion.PACKAGE_NAME}/images/emojione.sprites.png");` +
       `background-position: 0px -${this.mEmojiPositionMap[converted]}px;` +
       `background-repeat: no-repeat;`;

    emojione.asciiRegexp.lastIndex = 0;
    let removeEmoji: string = "",
      match: RegExpExecArray | null = emojione.asciiRegexp.exec(obj);
    if (match !== null && match.index === 0) {
      calculatedStyle += "cursor: pointer;";
      removeEmoji = `id='${spanId}'`;
    }
    html[idx++] = `<span style='${calculatedStyle}' ${removeEmoji} title='${obj}'></span>`;
    return idx;
  }

  public clicked(spanElement: HTMLElement, contentObjText: string, matchContext?: any, canvas?: any): void {
    spanElement.parentNode.replaceChild(document.createTextNode(spanElement.getAttribute("title")), spanElement);
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
    let spanEl: HTMLElement = document.getElementById(id);
    return (typeof spanEl !== "undefined" && spanEl !== null) ? spanEl.className : "";
  }

  public getClassName(object: string, context: string, id: string): string {
    let spanEl: HTMLElement = document.getElementById(id);
    return (typeof spanEl !== "undefined" && spanEl !== null) ? spanEl.className : "";
  }

  public getActiveClassName(object: string, context: string, id: string): string {
    let spanEl: HTMLElement = document.getElementById(id);
    return (typeof spanEl !== "undefined" && spanEl !== null) ? spanEl.className : "";
  }

  private addLinkToFrame(document: Document): void {
    // check if already added
    for (let i: number = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href.indexOf("emojione.sprites.css") !== -1) return;
    }
    let linkEl: HTMLLinkElement = document.createElement("link");
    linkEl.type = "text/css";
    linkEl.type = "stylesheet";
    linkEl.href = `/service/zimlet/${ZimletVersion.PACKAGE_NAME}/emojione.sprites.css`;
    document.head.appendChild(linkEl);
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
