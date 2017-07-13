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

import {ChatEventHandler} from "./ChatEventHandler";
import {ChatEvent} from "../ChatEvent";
import {ChatClient} from "../../ChatClient";
import {MessageAckReceivedEvent} from "../chat/MessageAckReceivedEvent";
import {MessageSent} from "../../MessageSent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";

export class MessageAckReceivedEventHandler implements ChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.MESSAGE_ACK;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let messageAckReceivedEvent: MessageAckReceivedEvent = <MessageAckReceivedEvent> chatEvent,
      messageSent: MessageSent = client.getMessageAckWaiter().getMessageById(messageAckReceivedEvent.getMessageId());
    if (messageSent != null) {
      messageSent.setDelivered();
      client.getMessageAckWaiter().removeMessage(messageSent);
    }
    return true;
  }
}
