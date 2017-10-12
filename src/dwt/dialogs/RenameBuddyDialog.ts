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
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {AjxStringUtil} from "../../zimbra/ajax/util/AjxStringUtil";
import {ZmDialog, ZmDialogParams} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {IdGenerator} from "../IdGenerator";

export class RenameBuddyDialog extends ZmDialog {
  private buddyNicknameEl: HTMLInputElement;
  private shell: DwtControl;
  private client: IChatClient;
  private buddy: IBuddy;

  constructor(params: ZmDialogParams, client: IChatClient, buddy: IBuddy) {
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
    this.buddyNicknameEl.focus();
  }

  private _createDialogView() {
    const data = {
      id: this._htmlElId,
      msg_nickname: StringUtils.getMessage("add_friends_username"),
    };
    const view = new DwtComposite(this);
    if (view.getHtmlElement() != null) {
      view.getHtmlElement().style.overflow = "auto";
      view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat_open.Windows#RenameBuddyDialog", data);
    }
    this.buddyNicknameEl = document.getElementById(data.id + "_nickname") as HTMLInputElement;
    this.buddyNicknameEl.value = AjxStringUtil.htmlDecode(this.buddy.getNickname());
    return view;
  }

  private _okBtnListener(): void {
    const newName = StringUtils.trim(this.buddyNicknameEl.value);
    if (newName !== "") {
      this.client.changeBuddyNickname(this.buddy, newName);
    }
    this.popdown();
  }

}
