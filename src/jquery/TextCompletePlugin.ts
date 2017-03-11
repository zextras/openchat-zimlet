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

import {JQueryPlugin} from "./JQueryPlugin";
import {JQueryTextComplete} from "../libext/jquery-textcomplete";
import {toImage, emojioneList} from "../libext/emojione";

declare let $: any;

const sorFcn = (a: string, b: string) => { return a.length - b.length; };

export class TextCompletePlugin implements JQueryPlugin {

  public install(): void {
    let imported = JQueryTextComplete;
  }

  public static installOnTextField(el: string|HTMLElement): void {
    $(el).textcomplete(
      [
        {
          match: /\B:([\-+\w]*)$/,
          search: function (term: string, callback: Function) {
            let results: string[] = [],
              returnResult: string[] = [];
            $.each(emojioneList, function (shortname: string, data: any) {
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
          template: function (shortname: string) {
            return `${toImage(shortname)} ${shortname}`;
          },
          replace: function (shortname: string) {
            return `${shortname} `;
          },
          index: 1,
          maxCount: 10
        }
      ],
      {}
    );
  }

}
