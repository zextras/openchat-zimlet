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
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ChatClient} from "../../client/ChatClient";
import {StringUtils} from "../../lib/StringUtils";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {IdGenerator} from "../IdGenerator";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtMessageDialog} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {Group} from "../../client/Group";

export class AddGroupDialog extends ZmDialog {

  private appCtxt: ZmAppCtxt;
  private client: ChatClient;
  private _groupNameEl: HTMLInputElement;

  constructor(params: ZmDialogParams, client: ChatClient, appCtxt: ZmAppCtxt) {
    params.title = StringUtils.getMessage("create_group_title");
    params.standardButtons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
    params.id = IdGenerator.generateId("ZxChat_AddGroupDialog");
    super(params);
    this.client = client;
    this.appCtxt = appCtxt;
    this.setView(this._createDialogView());
    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okBtnListener));
    this.addListener(DwtEvent.ENTER, new AjxListener(this, this._okBtnListener));
  }

  private _createDialogView() {
    let data = {
      id: this._htmlElId,
      msg_group_name: StringUtils.getMessage("create_group_name")
    };
    let view = new DwtComposite(this);
    if (view.getHtmlElement() != null) {
      view.getHtmlElement().style.overflow = "auto";
      view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat_open.Windows#AddGroupDialog", data);
    }
    this._groupNameEl = <HTMLInputElement>document.getElementById(data.id + "_group_name");
    return view;
  }

  public popup(loc?: DwtPoint): void {
    super.popup(loc);
    this._groupNameEl.focus();
  }

  public cleanInput(): void {
    this._groupNameEl.value = "";
  }

  private _okBtnListener(): void {
    let groupName = StringUtils.trim(this._groupNameEl.value);
    if (groupName === "") {
      return;
    }
    let group = this.client.getBuddyList().getGroup(groupName);
    if (group != null) {
      let msgDialog = this.appCtxt.getMsgDialog();
      msgDialog.setMessage(
        StringUtils.getMessage("cannote_create_group_already_exists", [groupName]),
        DwtMessageDialog.WARNING_STYLE
      );
      msgDialog.popup();
    } else {
      this.client.getBuddyList().addGroup(new Group(groupName));
      return this.popdown();
    }
  }

}
