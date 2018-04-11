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

import {IChatClient} from "../../client/IChatClient";
import {StringUtils} from "../../lib/StringUtils";
import {IBuddyListAction} from "../../redux/action/IBuddyListAction";
import {IOpenChatBuddyListMap, IOpenChatState} from "../../redux/IOpenChatState";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmAutocomplete, ZmAutocompleteMatch} from "../../zimbra/zimbraMail/share/model/ZmAutocomplete";
import {ZmDialog, ZmDialogParams} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {ZmAutocompleteListView} from "../../zimbra/zimbraMail/share/view/ZmAutocompleteListView";

import "./AddBuddyDialog.scss";

export class AddBuddyDialog extends ZmDialog {

  private static NAME_FROM_MAIL_REGEXP: RegExp = /^(.*)@/;

  private client: IChatClient;
  private userAliases: string[];
  private buddyAddressEl: HTMLElement;
  private buddyNicknameEl: HTMLElement;
  private mDataStore: Store<IOpenChatState>;

  constructor(
    params: IAddBuddyDialogParams,
    client: IChatClient,
    userAliases: string[],
    dataStore: Store<IOpenChatState>,
  ) {
    if (params.enableAutoComplete == null) {
      params.enableAutoComplete = false;
    }
    params.title = StringUtils.getMessage("add_friends_title");
    params.standardButtons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
    super(params);
    this.client = client;
    this.userAliases = userAliases;
    this.mDataStore = dataStore;
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
    const buddies: IOpenChatBuddyListMap = {};
    buddies[buddyId] = {
      capabilities: {},
      groups: [],
      jid: buddyId,
      lastMessageReceived: null,
      lastMessageSent: null,
      nickname: nickname,
      statuses: {},
      type: "buddy",
    };
    this.mDataStore.dispatch({
      buddies: buddies,
      type: "ADD_BUDDY_ONLY_SE",
    } as IBuddyListAction);
    this.popdown();
  }

}

export interface IAddBuddyDialogParams extends ZmDialogParams {
  dataClass?: ZmAutocomplete;
}
