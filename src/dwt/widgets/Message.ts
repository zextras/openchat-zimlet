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

import {Message as MessageObj} from "../../client/Message";
import {DateProvider} from "../../lib/DateProvider";
import {StringUtils} from "../../lib/StringUtils";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {Bowser} from "../../libext/bowser";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {AjxDateFormat} from "../../zimbra/ajax/util/AjxText";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmObjectManager} from "../../zimbra/zimbraMail/share/model/ZmObjectManager";
import {Conversation} from "./Conversation";

export class Message extends DwtComposite {

  public static TEMPLATE: string = "com_zextras_chat_open.Widgets#Message";

  public mDateProvider: DateProvider;
  protected mMessage: MessageObj;
  protected dateFormatter: AjxDateFormat;
  protected senderEl: HTMLElement;
  protected dateEl: HTMLElement;
  protected contentEl: HTMLElement;
  protected outerEl: HTMLElement;
  protected objectManager: ZmObjectManager;
  private mConversation: Conversation;

  constructor(
    parent: Conversation,
    message: MessageObj,
    dateProvider: DateProvider,
    template: string = Message.TEMPLATE,
  ) {
    super({
      parent: parent,
      template: template,
    });
    this.mMessage = message;
    this.mDateProvider = dateProvider;
    this.mConversation = parent;
    this.dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
    if (template !== "com_zextras_chat_open.Widgets#MessageStatus") {
      this._createHtml();
    }
    // TODO: Move to TimedCallback Factory
    setTimeout( // Lazy creation of the object manager
      this._delayedCreationFunction,
      100,
    );
    this._setAllowSelection();
  }

  public formatDate(date: Date): string {
    return this.dateFormatter.format(date);
  }

  public getObjectManager(): ZmObjectManager {
    if (this.objectManager == null) {
      this.objectManager = new ZmObjectManager(this);
    }
    return this.objectManager;
  }

  protected _createHtml(data: IMessageCreateHtmlData = {}): void {
    data.id = this._htmlElId;
    data.date = StringUtils.localizeHour(this.mMessage.getDate(), this.mDateProvider.getNow());
    data.dateTooltip = this.formatDate(this.mMessage.getDate());
    data.content = this.mMessage.getHtmlMessage();
    data.legacy = ZimbraUtils.isUniversalUI() ? "" : "-legacy-ui";
    DwtComposite.prototype._createHtmlFromTemplate.call(this, this.TEMPLATE, data);
    this.senderEl = document.getElementById(data.id + "_sender");
    this.dateEl = document.getElementById(data.id + "_date");
    this.contentEl = document.getElementById(data.id + "_content");
    this.outerEl = document.getElementById(data.id + "_outer");
    if (Bowser.msie && this.contentEl.offsetWidth > 141) {
      this.contentEl.style.width = "141px";
    }
  }

  // tslint:disable-next-line:variable-name
  private _delayedCreationFunction = () => {
    const manager = this.getObjectManager();
    try {
      manager.__hasSmileysHandler = true;
      appCtxt.notifyZimlets("onFindMsgObjects", [this, manager]);
      // TODO: Review these conditions
      manager.setHandlerAttr(
        ZmObjectManager.DATE,
        ZmObjectManager.ATTR_CURRENT_DATE,
        this.mMessage.getDate != null ? this.mMessage.getDate() : this.mDateProvider.getNow(),
      );
      if (manager.processObjectsInNode != null) {
        manager.processObjectsInNode(document, this.contentEl);
      } else {
        manager.findObjectsInNode(this.contentEl);
      }
    } catch (ign) {}
    if (this.mConversation.scrollToTop != null) {
      this.mConversation.scrollToTop();
    }
    const elements: NodeListOf<HTMLSpanElement> = this.getHtmlElement().getElementsByTagName("span");
    // tslint:disable-next-line
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.id.indexOf(manager._objectIdPrefix) !== -1) {
        const events = [];
        for (const ev of DwtEvent.MOUSE_EVENTS) {
          if (ev !== "onselectstart") {
            events.push(ev);
          }
        }
        this._setEventHdlrs(events, false);
      }
    }
  }

}

export interface IMessageCreateHtmlData {
  id?: string;
  date?: string;
  dateTooltip?: string;
  content?: string;
  sender?: string;
  legacy?: string;
}
