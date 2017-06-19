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

import {DwtMessageDialog} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {ChatClient} from "../../client/ChatClient";
import {Callback} from "../../lib/callbacks/Callback";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {IdGenerator} from "../IdGenerator";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {StringUtils} from "../../lib/StringUtils";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {Buddy} from "../../client/Buddy";

export class DeleteBuddyDialog extends DwtMessageDialog {

  private static _dialog: DeleteBuddyDialog = null;
  private client: ChatClient;
  private buddy: Buddy = null;
  private onDeletedCallback: Callback;

  constructor(shell: DwtShell, client: ChatClient, callback: Callback) {
    super({
      parent: shell,
      buttons: [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON],
      id: IdGenerator.generateId("ZxChat_DeleteBuddyDialog")
    });
    this.client = client;
    this.onDeletedCallback = callback;
    this.clear();
    this.setTitle(StringUtils.getMessage("delete_friends_title"));
    this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._yesBtnListener));
    this.addListener(DwtEvent.ENTER, new AjxListener(this, this._yesBtnListener));
  }

  public static getDialog(shell: DwtShell, client: ChatClient, callback: Callback) {
    if (DeleteBuddyDialog._dialog == null) {
      DeleteBuddyDialog._dialog = new DeleteBuddyDialog(shell, client, callback);
    }
    DeleteBuddyDialog._dialog.clear();
    return DeleteBuddyDialog._dialog;
  }

  public setBuddy(buddy: Buddy): void {
    this.buddy = buddy;
    DeleteBuddyDialog._dialog.setMessage(StringUtils.getMessage("delete_friends_text", [buddy.getNickname()]), DwtMessageDialog.WARNING_STYLE);
  }

  public clear(): void {
    this.buddy = null;
    this.setMessage(StringUtils.getMessage("delete_friends_text", [""]), DwtMessageDialog.WARNING_STYLE);
  }

  private _yesBtnListener(): void {
    if (typeof this.buddy !== null) {
      this.client.deleteFriendship(this.buddy, this.onDeletedCallback);
    }
    this.popdown();
  }

}
