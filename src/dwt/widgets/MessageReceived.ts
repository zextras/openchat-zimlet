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

import {Message} from "./Message";
import {DateProvider} from "../../lib/DateProvider";
import {Conversation} from "./Conversation";
import {Callback} from "../../lib/callbacks/Callback";
import {MessageReceived as MessageReceivedObj} from "../../client/MessageReceived";

export class MessageReceived extends Message {

  constructor(parent: Conversation, message: MessageReceivedObj, dateProvider: DateProvider) {
    super(parent, message, dateProvider);
    (<HTMLElement>this.getHtmlElement().childNodes[0]).setAttribute("sender", "true");
    let buddy = message.getSender();
    buddy.onNicknameChange(new Callback(this, this._updateBuddyNickname));
  }

  public _createHtml(): void {
    super._createHtml({
      sender: (<MessageReceivedObj>this.message).getSender().getNickname()
    });
  }

  public _updateBuddyNickname(nickname: string): void {
    if (this._senderEl) {
      if (typeof this._senderEl.innerHTML !== "undefined") {
        this._senderEl.innerHTML = nickname;
      } else if (typeof this._senderEl.innerText !== "undefined") {
        this._senderEl.innerText = nickname;
      }
    }
  }

}