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

import {Message, MessageCreateHtmlData} from "./Message";
import {Buddy} from "../../client/Buddy";
import {BuddyStatus} from "../../client/BuddyStatus";
import {DateProvider} from "../../lib/DateProvider";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {Conversation} from "./Conversation";
import {MessageReceived} from "../../client/MessageReceived";
import {AjxStringUtil} from "../../zimbra/ajax/util/AjxStringUtil";

export class MessageStatus extends Message {

  private mDate: Date;
  private mBuddy: Buddy;
  private mStatus: BuddyStatus;

  constructor(parent: Conversation, buddy: Buddy, status: BuddyStatus, dateProvider: DateProvider) {
    super(
      parent,
      new MessageReceived("", buddy, dateProvider.getNow(), status.getMessage()),
      dateProvider,
      "com_zextras_chat_open.Widgets#MessageStatus"
    );
    this.mDate = dateProvider.getNow();
    this.mBuddy = buddy;
    this.mStatus = status;
    this._createHtml();
    this.getHtmlElement().setAttribute("status", AjxStringUtil.htmlEncode(status.getMessageLabel()));
  }

  protected _createHtml(data: MessageCreateHtmlData = {}): void {
    data = {
      ...data,
      id: this._htmlElId,
      sender: this.mBuddy.getNickname(),
      content: this.mMessage.getMessage()
    };
    DwtComposite.prototype._createHtmlFromTemplate.call(this, this.TEMPLATE, data);
    this._senderEl = document.getElementById(data.id + "_sender");
    this._contentEl = document.getElementById(data.id + "_content");
  }
}
