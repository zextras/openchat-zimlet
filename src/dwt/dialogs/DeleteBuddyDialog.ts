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

import {Store} from "redux";
import {RemoveFriendshipEvent} from "../../client/events/chat/RemoveFriendshipEvent";
import {IBuddy} from "../../client/IBuddy";
import {IChatClient} from "../../client/IChatClient";
import {StringUtils} from "../../lib/StringUtils";
import {IBuddyListAction} from "../../redux/action/IBuddyListAction";
import {IOpenChatState} from "../../redux/IOpenChatState";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtMessageDialog} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {IdGenerator} from "../IdGenerator";

export class DeleteBuddyDialog extends DwtMessageDialog {

  public static getDialog(
    shell: DwtShell,
    // client: IChatClient,
    callback: (ev: RemoveFriendshipEvent) => void,
    dataStore?: Store<IOpenChatState>,
  ) {
    if (DeleteBuddyDialog._DIALOG == null) {
      DeleteBuddyDialog._DIALOG = new DeleteBuddyDialog(
        shell,
        // client,
        callback,
        dataStore,
      );
    }
    DeleteBuddyDialog._DIALOG.clear();
    return DeleteBuddyDialog._DIALOG;
  }

  private static _DIALOG: DeleteBuddyDialog = null;
  // private client: IChatClient;
  private buddy: IBuddy = null;
  private onDeletedCallback: (ev: RemoveFriendshipEvent) => void;

  private mDataStore: Store<IOpenChatState>;
  private mBuddyJid: string;

  constructor(
    shell: DwtShell,
    // client: IChatClient,
    callback: (ev: RemoveFriendshipEvent) => void,
    dataStore?: Store<IOpenChatState>,
    inAppBuddyJid?: string,
  ) {
    super({
      buttons: [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON],
      id: IdGenerator.generateId("ZxChat_DeleteBuddyDialog"),
      parent: shell,
    });
    // this.client = client;
    this.onDeletedCallback = callback;
    if (typeof dataStore !== "undefined") {
      this.mDataStore = dataStore;
      this.mBuddyJid = inAppBuddyJid;
    }
    this.clear();
    this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._yesBtnListener));
    this.addListener(DwtEvent.ENTER, new AjxListener(this, this._yesBtnListener));
  }

  public setBuddy(buddy: IBuddy): void {
    this.buddy = buddy;
    DeleteBuddyDialog._DIALOG.setMessage(
      StringUtils.getMessage(
        "delete_friends_text",
        [buddy.getNickname()],
      ),
      DwtMessageDialog.WARNING_STYLE,
    );
    this.setTitle(StringUtils.getMessage("delete_friends_title"));
  }

  public clear(): void {
    this.buddy = null;
    this.setMessage(StringUtils.getMessage("delete_friends_text", [""]), DwtMessageDialog.WARNING_STYLE);
  }

  private _yesBtnListener(): void {
    if (typeof this.mDataStore !== "undefined") {
      const buddies: {[buddyJid: string]: {}} = {};
      buddies[this.buddy.getId()] = {};
      this.mDataStore.dispatch({
        buddies: buddies,
        callback: this.onDeletedCallback,
        type: "REMOVE_BUDDIES_FROM_BUDDY_LIST_SE",
      } as IBuddyListAction & {callback: (ev: RemoveFriendshipEvent) => void});
    // } else if (typeof this.buddy !== "undefined" && this.buddy !== null) {
    //   this.client.deleteFriendship(this.buddy, this.onDeletedCallback);
    }
    this.popdown();
  }

}
