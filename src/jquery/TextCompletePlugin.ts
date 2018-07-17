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

import {emojioneList, toImage} from "../libext/emojione";
import {JQueryTextComplete} from "../libext/jquery-textcomplete";
import {IJQueryPlugin} from "./JQueryPlugin";

import "./TextCompletePlugin.scss";

declare let $: any;

const sorFcn = (a: string, b: string) => a.length - b.length;

export class TextCompletePlugin implements IJQueryPlugin {

  public static installOnTextField(el: string|HTMLElement): void {
    if (!TextCompletePlugin.sInstalled) { return; }
    if (typeof $(el).textcomplete === "undefined") {
      return;
    }
    $(el).textcomplete(
      [
        {
          index: 1,
          match: /\B:([\-+\w]*)$/,
          maxCount: 10,
          replace: (shortname: string) => {
            return `${shortname} `;
          },
          search: (term: string, callback: (returnResult: string[]) => void) => {
            const results: string[] = [];
            let returnResult: string[] = [];
            $.each(emojioneList, (shortname: string, data: any) => {
              if (shortname.indexOf(term) > -1) {
                results.push(shortname);
              }
            });
            if (term.length >= 2) {
              results.sort(sorFcn);
              returnResult = [].concat(results);
            }
            callback(returnResult);
          },
          template: (shortname: string) => {
            return `${toImage(shortname).replace(/emojione emojione-/g, `emojione_16 emojione_16-`)} ${shortname}`;
          },
        },
      ],
      {},
    );
  }

  private static sInstalled: boolean = false;

  public install(): void {
    const imported = JQueryTextComplete;
    TextCompletePlugin.sInstalled = true;
  }

}
