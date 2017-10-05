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

import {BuddyStatusType} from "../../client/BuddyStatusType";
import {IBuddy} from "../../client/IBuddy";
import {IChatClient} from "../../client/IChatClient";
import {ArrayUtils} from "../../lib/ArrayUtils";
import {StringUtils} from "../../lib/StringUtils";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtMessageDialog} from "../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmAutocomplete, ZmAutocompleteMatch} from "../../zimbra/zimbraMail/share/model/ZmAutocomplete";
import {ZmDialog, ZmDialogParams} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {ZmAutocompleteListView} from "../../zimbra/zimbraMail/share/view/ZmAutocompleteListView";

export class AddBuddyDialog extends ZmDialog {

  private static NAME_FROM_MAIL_REGEXP: RegExp = /^(.*)@/;

  private client: IChatClient;
  private userAliases: string[];
  private buddyAddressEl: HTMLElement;
  private buddyNicknameEl: HTMLElement;

  constructor(params: IAddBuddyDialogParams, client: IChatClient, userAliases: string[]) {
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

  public popup(): void {
    super.popup();
    this.buddyAddressEl.focus();
  }

  public cleanInput(): void {
    (this.buddyAddressEl as HTMLInputElement).value = "";
    (this.buddyNicknameEl as HTMLInputElement).value = "";
  }

  /**
   * Create the dialog using the template
   * @returns {DwtComposite}
   * @private
   */
  private _createDialogView(): DwtComposite {
    const data = {
      id: this._htmlElId,
      msg_email: StringUtils.getMessage("add_friends_email"),
      msg_nickname: StringUtils.getMessage("add_friends_username"),
    };
    const view = new DwtComposite(this);
    if (view.getHtmlElement() != null) {
      view.getHtmlElement().style.overflow = "auto";
      view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat_open.Windows#AddBuddyDialog", data);
    }
    this.buddyAddressEl = document.getElementById(data.id + "_email");
    this.buddyNicknameEl = document.getElementById(data.id + "_nickname");
    return view;
  }

  /**
   * Initialize the auto-completer on the mail field.
   * @param parent
   * @param autoCompleter
   * @private
   */
  private _initAutoComplete(parent: DwtControl, autoCompleter: ZmAutocomplete): void {
    const acAddrSelectList = new ZmAutocompleteListView({
      dataClass: autoCompleter,
      matchValue: ZmAutocomplete.AC_VALUE_EMAIL,
      parent: parent,
    });
    acAddrSelectList.handle(this.buddyAddressEl as HTMLInputElement);
    acAddrSelectList.addCallback(
      ZmAutocompleteListView.CB_COMPLETION,
      new AjxListener(this, this._autocompleteListener),
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
    (this.buddyNicknameEl as HTMLInputElement).value = name;
    this.buddyNicknameEl.focus();
  }

  private _okBtnListener(): void {
    const buddyId: string = (this.buddyAddressEl as HTMLInputElement).value.replace(/([^ ;,:]*@[^ ;,:]*).*/, "$1");
    const nickname: string = (this.buddyNicknameEl as HTMLInputElement).value;
    const group: string = "";
    const buddy: IBuddy = this.client.getBuddyList().getBuddyById(buddyId);
    let msgDialog: DwtMessageDialog;
    if ((buddy != null) && buddy.getStatus().getType() !== BuddyStatusType.INVITED) {
      this.popdown();
      msgDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(StringUtils.getMessage("friend_already_added"));
      return msgDialog.popup();
    } else if (ArrayUtils.indexOf(this.userAliases, buddyId) >= 0
      || (buddyId === this.client.getSessionInfoProvider().getUsername())
      || (buddyId === "")
    ) {
      this.popdown();
      msgDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(StringUtils.getMessage("err_adding_friend"), DwtMessageDialog.WARNING_STYLE);
      return msgDialog.popup();
    } else {
      this.popdown();
      return this.client.sendFriendship(buddyId, nickname, group);
    }
  }

}

export interface IAddBuddyDialogParams extends ZmDialogParams {
  dataClass?: ZmAutocomplete;
}
