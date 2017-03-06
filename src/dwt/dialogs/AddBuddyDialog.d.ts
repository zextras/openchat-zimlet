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

import {ZmDialog} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {ZmAutocomplete} from "../../zimbra/zimbraMail/share/model/ZmAutocomplete";
import {ChatClient} from "../../client/ChatClient";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";

export declare class AddBuddyDialog extends ZmDialog {

  constructor(
    params: {
      parent: DwtShell,
      enableAutoComplete: boolean,
      dataClass: ZmAutocomplete
    },
    chatclient: ChatClient,
    appCtxt: ZmAppCtxt,
    aliases: string[]
  )

  public _buddyAddressEl: HTMLInputElement;
  public _buddyNicknameEl: HTMLInputElement;

  public _okBtnListener(): void;
  public cleanInput(): void;
}
