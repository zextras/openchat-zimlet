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

import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DateProvider} from "../../lib/DateProvider";
import {AjxDateFormat} from "../../zimbra/ajax/util/AjxText";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmObjectManager} from "../../zimbra/zimbraMail/share/model/ZmObjectManager";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {StringUtils} from "../../lib/StringUtils";
import {Message as MessageObj} from "../../client/Message";
import {Conversation} from "./Conversation";
import {ZimbraUtils} from "../../lib/ZimbraUtils";

export class Message extends DwtComposite {

  public static TEMPLATE: string = "com_zextras_chat_open.Widgets#Message";

  protected mMessage: MessageObj;
  public mDateProvider: DateProvider;
  private mConversation: Conversation;
  protected _dateFormatter: AjxDateFormat;
  protected _senderEl: HTMLElement;
  protected _dateEl: HTMLElement;
  protected _contentEl: HTMLElement;
  protected _objectManager: ZmObjectManager;

  constructor(
    parent: Conversation,
    message: MessageObj,
    dateProvider: DateProvider,
    template: string = Message.TEMPLATE
  ) {
    super({
      parent: parent,
      template: template
    });
    this.mMessage = message;
    this.mDateProvider = dateProvider;
    this.mConversation = parent;
    this._dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
    if (template !== "com_zextras_chat_open.Widgets#MessageStatus") {
      this._createHtml();
    }
    // TODO: Move to TimedCallback Factory
    setTimeout( // Lazy creation of the object manager
      () => this._delayedCreationFunction(),
      100
    );
    this._setAllowSelection();
  }

  private _delayedCreationFunction(): void {
    const manager = this.getObjectManager();
    try {
      manager.__hasSmileysHandler = true;
      appCtxt.notifyZimlets("onFindMsgObjects", [this, manager]);
      // TODO: Review these conditions
      manager.setHandlerAttr(ZmObjectManager.DATE, ZmObjectManager.ATTR_CURRENT_DATE, this.mMessage.getDate != null ? this.mMessage.getDate() : this.mDateProvider.getNow());
      if (manager.processObjectsInNode != null) {
        manager.processObjectsInNode(document, this._contentEl);
      } else {
        manager.findObjectsInNode(this._contentEl);
      }
    } catch (ign) {}
    if (this.mConversation.scrollToTop != null) {
      this.mConversation.scrollToTop();
    }
    let elements = this.getHtmlElement().getElementsByTagName("span");
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      if (element.id.indexOf(manager._objectIdPrefix) !== -1) {
        let events = [];
        for (let ev of DwtEvent.MOUSE_EVENTS) {
          if (ev !== "onselectstart") {
            events.push(ev);
          }
        }
        this._setEventHdlrs(events, false);
      }
    }
  }

  public formatDate(date: Date): string {
    return this._dateFormatter.format(date);
  }

  protected _createHtml(data: MessageCreateHtmlData = {}): void {
    data.id = this._htmlElId;
    data.date = StringUtils.localizeHour(this.mMessage.getDate(), this.mDateProvider.getNow());
    data.dateTooltip = this.formatDate(this.mMessage.getDate());
    data.content = this.mMessage.getHtmlMessage();
    data.legacy = ZimbraUtils.isUniversalUI() ? "" : "-legacy-ui";
    DwtComposite.prototype._createHtmlFromTemplate.call(this, this.TEMPLATE, data);
    this._senderEl = document.getElementById(data.id + "_sender");
    this._dateEl = document.getElementById(data.id + "_date");
    this._contentEl = document.getElementById(data.id + "_content");
  }

  public getObjectManager(): ZmObjectManager {
    if (this._objectManager == null) {
      this._objectManager = new ZmObjectManager(this);
    }
    return this._objectManager;
  }

}

export interface MessageCreateHtmlData {
  id?: string;
  date?: string;
  dateTooltip?: string;
  content?: string;
  sender?: string;
  legacy?: string;
}
