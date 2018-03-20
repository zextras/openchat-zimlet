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
import {IDateProvider} from "../../lib/IDateProvider";
import {LearningClipUtils} from "../../lib/LearningClipUtils";
import {Conversation} from "./Conversation";
import {Message} from "./Message";

export class MessageReceived extends Message {

  constructor(parent: Conversation, message: MessageReceivedObj, dateProvider: IDateProvider) {
    super(parent, message, dateProvider);
    (this.getHtmlElement().childNodes[0] as HTMLElement).className += " ZxChat_MessageContainerSenderTrue";
    const buddy: IBuddy = message.getSender();
    buddy.onNicknameChange(new Callback(this, this._updateBuddyNickname));
  }

  public _createHtml(): void {
    const shortNickname = LearningClipUtils.clip(
      (this.mMessage as MessageReceivedObj).getSender().getNickname(),
      165,
      "ZxChat_MessageSender",
    );
    super._createHtml({
      sender: shortNickname,
    });
  }

  public _updateBuddyNickname(nickname: string): void {
    const shortNickname = LearningClipUtils.clip(
      nickname,
      165,
      "ZxChat_MessageSender",
    );
    if (this.senderEl) {
      if (typeof this.senderEl.innerHTML !== "undefined") {
        this.senderEl.innerHTML = shortNickname;
      } else if (typeof this.senderEl.innerText !== "undefined") {
        this.senderEl.innerText = shortNickname;
      }
    }
  }

}
