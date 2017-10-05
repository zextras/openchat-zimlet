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

import {IBuddy} from "../../client/IBuddy";
import {MessageReceived as MessageReceivedObj} from "../../client/MessageReceived";
import {Callback} from "../../lib/callbacks/Callback";
import {DateProvider} from "../../lib/DateProvider";
import {Conversation} from "./Conversation";
import {Message} from "./Message";

export class MessageReceived extends Message {

  constructor(parent: Conversation, message: MessageReceivedObj, dateProvider: DateProvider) {
    super(parent, message, dateProvider);
    (this.getHtmlElement().childNodes[0] as HTMLElement).setAttribute("sender", "true");
    const buddy: IBuddy = message.getSender();
    buddy.onNicknameChange(new Callback(this, this._updateBuddyNickname));
  }

  public _createHtml(): void {
    super._createHtml({
      sender: (this.mMessage as MessageReceivedObj).getSender().getNickname(),
    });
  }

  public _updateBuddyNickname(nickname: string): void {
    if (this.senderEl) {
      if (typeof this.senderEl.innerHTML !== "undefined") {
        this.senderEl.innerHTML = nickname;
      } else if (typeof this.senderEl.innerText !== "undefined") {
        this.senderEl.innerText = nickname;
      }
    }
  }

}
