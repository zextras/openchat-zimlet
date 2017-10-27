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

import {MessageSent as MessageSentObj} from "../../client/MessageSent";
import {Callback} from "../../lib/callbacks/Callback";
import {DateProvider} from "../../lib/DateProvider";
import {StringUtils} from "../../lib/StringUtils";
import {Conversation} from "./Conversation";
import {Message} from "./Message";

export class MessageSent extends Message {

  constructor(parent: Conversation, message: MessageSentObj, dateProvider: DateProvider) {
    super(parent, message, dateProvider);
    (this.getHtmlElement().childNodes[0] as HTMLElement).setAttribute("sender", "false");
    (this.mMessage as MessageSentObj).onSetDelivered(new Callback(this, this.setDelivered));
    this.setDelivered(message.isDelivered());
  }

  public _createHtml(): void {
    super._createHtml({
      sender: StringUtils.getMessage("Me"),
    });
  }

  public setDelivered(delivered = true): void {
    const opacity: number = delivered ? 1 : 0.6;
    if (typeof this.getHtmlElement() !== "undefined") {
      this.getHtmlElement().style.opacity = `${opacity}`;
    }
  }

}
