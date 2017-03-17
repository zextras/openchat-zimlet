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

import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmDialog, ZmDialogParams} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {StringUtils} from "../../lib/StringUtils";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {ZmAutocompleteListView} from "../../zimbra/zimbraMail/share/view/ZmAutocompleteListView";
import {ZmAutocomplete, ZmAutocompleteMatch} from "../../zimbra/zimbraMail/share/model/ZmAutocomplete";
import {DwtMessageDialog} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {BuddyStatusType} from "../../client/BuddyStatusType";
import {ChatClient} from "../../client/ChatClient";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {Buddy} from "../../client/Buddy";
import {ArrayUtils} from "../../lib/ArrayUtils";

export class AddBuddyDialog extends ZmDialog {

  private static NAME_FROM_MAIL_REGEXP: RegExp = /^(.*)@/;

  private client: ChatClient;
  private userAliases: string[];
  private _buddyAddressEl: HTMLElement;
  private _buddyNicknameEl: HTMLElement;

  constructor(params: AddBuddyDialogParams, client: ChatClient, userAliases: string[]) {
    if (params.enableAutoComplete == null) {
      params.enableAutoComplete = false;
    }
    params.title = StringUtils.getMessage("add_friends_title");
    params.standardButtons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
    super(params);
    this.client = client;
    this.userAliases = userAliases;
    this.setView(this._createDialogView());
    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okBtnListener));
    this.addListener(DwtEvent.ENTER, new AjxListener(this, this._okBtnListener));
    if (params.enableAutoComplete) {
      this._initAutoComplete(params.parent, params.dataClass);
    }
  }

  /**
   * Create the dialog using the template
   * @returns {DwtComposite}
   * @private
   */
  private _createDialogView(): DwtComposite {
    let data = {
      id: this._htmlElId,
      msg_email: StringUtils.getMessage("add_friends_email"),
      msg_nickname: StringUtils.getMessage("add_friends_username")
    };
    let view = new DwtComposite(this);
    if (view.getHtmlElement() != null) {
      view.getHtmlElement().style.overflow = "auto";
      view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat_open.Windows#AddBuddyDialog", data);
    }
    this._buddyAddressEl = document.getElementById(data.id + "_email");
    this._buddyNicknameEl = document.getElementById(data.id + "_nickname");
    return view;
  }

  public popup(): void {
    super.popup();
    this._buddyAddressEl.focus();
  }

  /**
   * Initialize the auto-completer on the mail field.
   * @param parent
   * @param autoCompleter
   * @private
   */
  private _initAutoComplete(parent: DwtControl, autoCompleter: ZmAutocomplete): void {
    let acAddrSelectList = new ZmAutocompleteListView({
      parent: parent,
      dataClass: autoCompleter,
      matchValue: ZmAutocomplete.AC_VALUE_EMAIL
    });
    acAddrSelectList.handle(<HTMLInputElement>this._buddyAddressEl);
    acAddrSelectList.addCallback(
      ZmAutocompleteListView.CB_COMPLETION,
      new AjxListener(this, this._autocompleteListener)
    );
  }

  private _autocompleteListener(address: string, el: HTMLInputElement, match: ZmAutocompleteMatch): void {
    let name = "";
    if (typeof match !== "undefined" && match !== null) {
      name = match.name;
    }
    if (name === "") {
      if (AddBuddyDialog.NAME_FROM_MAIL_REGEXP.test(name)) {
        name = AddBuddyDialog.NAME_FROM_MAIL_REGEXP.exec(name)[1];
      } else {
        name = address;
      }
    }
    (<HTMLInputElement>this._buddyNicknameEl).value = name;
    this._buddyNicknameEl.focus();
  }

  private _okBtnListener(): void {
    let buddyId: string = (<HTMLInputElement>this._buddyAddressEl).value.replace(/([^ ;,:]*@[^ ;,:]*).*/, "$1");
    let nickname: string = (<HTMLInputElement>this._buddyNicknameEl).value;
    let group: string = "";
    let buddy: Buddy = this.client.getBuddyList().getBuddyById(buddyId);
    let msgDialog: DwtMessageDialog;
    if ((buddy != null) && buddy.getStatus().getType() !== BuddyStatusType.INVITED) {
      this.popdown();
      msgDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(StringUtils.getMessage("friend_already_added"));
      return msgDialog.popup();
    } else if (ArrayUtils.indexOf(this.userAliases, buddyId) >= 0 || (buddyId === this.client.getSessionInfoProvider().getUsername()) || (buddyId === "")) {
      this.popdown();
      msgDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(StringUtils.getMessage("err_adding_friend"), DwtMessageDialog.WARNING_STYLE);
      return msgDialog.popup();
    } else {
      this.popdown();
      return this.client.sendFriendship(buddyId, nickname, group);
    }
  }

  public cleanInput(): void {
    (<HTMLInputElement>this._buddyAddressEl).value = "";
    (<HTMLInputElement>this._buddyNicknameEl).value = "";
  }

}

export interface AddBuddyDialogParams extends ZmDialogParams {
  dataClass?: ZmAutocomplete;
}
