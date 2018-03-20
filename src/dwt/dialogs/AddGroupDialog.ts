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

import {Group} from "../../client/Group";
import {IChatClient} from "../../client/IChatClient";
import {StringUtils} from "../../lib/StringUtils";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtMessageDialog} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ZmDialog, ZmDialogParams} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";
import {IdGenerator} from "../IdGenerator";

export class AddGroupDialog extends ZmDialog {

  private appCtxt: ZmAppCtxt;
  private client: IChatClient;
  private groupNameEl: HTMLInputElement;

  constructor(params: ZmDialogParams, client: IChatClient, appCtxt: ZmAppCtxt) {
    params.title = ZmMsg.newFolder;
    params.standardButtons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
    params.id = IdGenerator.generateId("ZxChat_AddGroupDialog");
    super(params);
    this.client = client;
    this.appCtxt = appCtxt;
    this.setView(this._createDialogView());
    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okBtnListener));
    this.addListener(DwtEvent.ENTER, new AjxListener(this, this._okBtnListener));
  }

  public popup(loc?: DwtPoint): void {
    super.popup(loc);
    this.groupNameEl.focus();
  }

  public cleanInput(): void {
    this.groupNameEl.value = "";
  }

  private _createDialogView() {
    const data = {
      id: this._htmlElId,
      msg_group_name: StringUtils.getMessage("create_group_name"),
    };
    const view = new DwtComposite(this);
    if (view.getHtmlElement() != null) {
      view.getHtmlElement().style.overflow = "auto";
      view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat_open.Windows#AddGroupDialog", data);
    }
    this.groupNameEl = document.getElementById(data.id + "_group_name") as HTMLInputElement;
    return view;
  }

  private _okBtnListener(): void {
    const groupName = StringUtils.trim(this.groupNameEl.value);
    if (groupName === "") {
      return;
    }
    const group = this.client.getBuddyList().getGroup(groupName);
    if (group != null) {
      const msgDialog = this.appCtxt.getMsgDialog();
      msgDialog.setMessage(
        StringUtils.getMessage("cannote_create_group_already_exists", [groupName]),
        DwtMessageDialog.WARNING_STYLE,
      );
      msgDialog.popup();
    } else {
      this.client.getBuddyList().addGroup(new Group(groupName));
      return this.popdown();
    }
  }

}
