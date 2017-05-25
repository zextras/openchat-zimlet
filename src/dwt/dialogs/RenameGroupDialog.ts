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
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {Group} from "../../client/Group";
import {StringUtils} from "../../lib/StringUtils";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {IdGenerator} from "../IdGenerator";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtMessageDialog} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";

export class RenameGroupDialog extends ZmDialog {

  private appCtxt: ZmAppCtxt;
  private client: ChatClient;
  private group: Group;
  private _groupNameEl: HTMLInputElement;

  constructor(params: ZmDialogParams, client: ChatClient, appCtxt: ZmAppCtxt, group: Group) {
    params.title = StringUtils.getMessage("rename_group_title");
    params.standardButtons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
    params.id = IdGenerator.generateId("ZxChat_RenameGroupDialog_" + (group.getName()));
    super(params);
    this.client = client;
    this.appCtxt = appCtxt;
    this.group = group;
    this.setView(this._createDialogView());
    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okBtnListener));
    this.addListener(DwtEvent.ENTER, new AjxListener(this, this._okBtnListener));
  }


  public popup(loc?: DwtPoint | any, focusButtonId?: number | any): void {
    super.popup(loc, focusButtonId);
    this._groupNameEl.focus();
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
    this._groupNameEl.value = this.group.getName();
    return view;
  }

  public _okBtnListener() {
    let newName = StringUtils.trim(this._groupNameEl.value);
    let group = this.client.getBuddyList().getGroup(newName);
    if (group != null) {
      let msgDialog = this.appCtxt.getMsgDialog();
      msgDialog.setMessage(StringUtils.getMessage("cannote_create_group_already_exists", [newName]), DwtMessageDialog.WARNING_STYLE);
      return msgDialog.popup();
    } else {
      let oldName = this.group.getName();
      this.group.setName(newName);
      this.client.renameGroup(oldName, newName);
      return this.popdown();
    }
  }

}
