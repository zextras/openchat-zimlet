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

import {ZmAutocomplete, ZmAutocompleteMatch} from "../zimbra/zimbraMail/share/model/ZmAutocomplete";
import {ZmAutocompleteListView} from "../zimbra/zimbraMail/share/view/ZmAutocompleteListView";

import {IAutoCompleteSuggestion} from "./IAutoCompleteSuggestion";
import {IAutoCompleteSuggestionsProvider} from "./IAutoCompleteSuggestionsProvider";

export class ZmAutoCompleteSuggestionsProvider implements IAutoCompleteSuggestionsProvider {

  private static onAutocompleteResult(res: ZmAutocompleteMatch[], cbk: (res: IAutoCompleteSuggestion[]) => void): void {
    const suggestions: IAutoCompleteSuggestion[] = [];
    if (res === null) {
      cbk([]);
      return;
    }
    for (const match of res) {
      if (match.isDL || match.isGroup) { continue; }
      suggestions.push({
        email: match.email,
        isDL: match.isDL,
        isGroup: match.isGroup,
        name: match.name,
      });
    }
    cbk(suggestions);
  }

  private mAutoCompleter: ZmAutocomplete;

  constructor(autoCompleter: ZmAutocomplete) {
    this.mAutoCompleter = autoCompleter;
  }

  public autocompleteMatch(str: string, cbk: (res: IAutoCompleteSuggestion[]) => void): void {
    const lv = new ZmAutocompleteListView({parent: undefined, dataClass: undefined, matchValue: undefined});
    this.mAutoCompleter.autocompleteMatch(
      str,
      (res: ZmAutocompleteMatch[]) => ZmAutoCompleteSuggestionsProvider.onAutocompleteResult(res, cbk),
      lv,
      {},
    );
  }
}
