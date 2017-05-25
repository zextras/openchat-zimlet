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

import {ZmDialog, ZmDialogParams} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {ChatClient} from "../../client/ChatClient";
import {Buddy} from "../../client/Buddy";
import {StringUtils} from "../../lib/StringUtils";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {IdGenerator} from "../IdGenerator";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";

export class RenameBuddyDialog extends ZmDialog {
  private _buddyNicknameEl: HTMLInputElement;
  private shell: DwtControl;
  private client: ChatClient;
  private buddy: Buddy;

  constructor(params: ZmDialogParams, client: ChatClient, buddy: Buddy) {
    params.title = StringUtils.getMessage("friend_rename");
    params.standardButtons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
    params.id = IdGenerator.generateId("ZxChat_RenameBuddyDialog");
    super(params);
    this.client = client;
    this.buddy = buddy;
    this.shell = params.parent;
    this.setView(this._createDialogView());
    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okBtnListener));
    this.addListener(DwtEvent.ENTER, new AjxListener(this, this._okBtnListener));
  }

  public popup(loc?: DwtPoint | any, focusButtonId?: number | any): void {
    super.popup(loc, focusButtonId);
    this._buddyNicknameEl.focus();
  }

  private _createDialogView() {
    let data = {
      id: this._htmlElId,
      msg_nickname: StringUtils.getMessage("add_friends_username")
    };
    let view = new DwtComposite(this);
    if (view.getHtmlElement() != null) {
      view.getHtmlElement().style.overflow = "auto";
      view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat_open.Windows#RenameBuddyDialog", data);
    }
    this._buddyNicknameEl = <HTMLInputElement>document.getElementById(data.id + "_nickname");
    this._buddyNicknameEl.value = this.buddy.getNickname();
    return view;
  }

  private _okBtnListener(): void {
    let newName = StringUtils.trim(this._buddyNicknameEl.value);
    if (newName !== "") {
      this.client.changeBuddyNickname(this.buddy, newName);
    }
    this.popdown();
  }

}
