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

import {IBuddy} from "../../client/IBuddy";
import {IChatClient} from "../../client/IChatClient";
import {StringUtils} from "../../lib/StringUtils";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtMessageDialog, DwtMessageDialogParams} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {IdGenerator} from "../IdGenerator";

export class AcceptFriendshipDialog extends DwtMessageDialog {

  public static getDialog(params: DwtMessageDialogParams, client: IChatClient, buddy: IBuddy): AcceptFriendshipDialog {
    if (AcceptFriendshipDialog._DIALOG === null) {
      AcceptFriendshipDialog._DIALOG = new AcceptFriendshipDialog(params, client, buddy);
    }
    if (typeof buddy !== "undefined" && buddy !== null) {
      AcceptFriendshipDialog._DIALOG.buddy = buddy;
      AcceptFriendshipDialog._DIALOG.setMessage(
        StringUtils.getMessage(
          "accept_friends_text",
          [buddy.getNickname()],
        ),
      );
    }
    return AcceptFriendshipDialog._DIALOG;
  }

  private static _DIALOG: AcceptFriendshipDialog = null;
  private client: IChatClient;
  private buddy: IBuddy;

  constructor(params: DwtMessageDialogParams, client: IChatClient, buddy: IBuddy) {
    super({
      buttons: [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON],
      id: IdGenerator.generateId("ZxChat_AcceptFriendshipDialog"),
      parent: params.parent,
    });
    this.client = client;
    this.buddy = buddy;
    this.setTitle(StringUtils.getMessage("accept_friends_title"));
    this.setMessage(
      StringUtils.getMessage(
        "accept_friends_text",
        [this.buddy.getNickname()],
      ),
    );
    this.setButtonListener(
      DwtDialog.YES_BUTTON,
      new AjxListener(this, this._yesBtnListener),
    );
    this.addListener(
      DwtEvent.ENTER,
      new AjxListener(this, this._yesBtnListener),
    );
  }

  private _yesBtnListener(): void {
    this.client.acceptFriendship(this.buddy);
    this.buddy = null;
    this.popdown();
  }

}
