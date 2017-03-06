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
import {MessageEvent, MessageType} from "../chat/MessageEvent";
import {ChatEvent} from "../ChatEvent";
import {ChatClient} from "../../ChatClient";
import {WritingStatusEvent} from "../chat/WritingStatusEvent";
import {MessageWritingStatus} from "../../MessageWritingStatus";
import {MessageReceived} from "../../MessageReceived";
import {Buddy} from "../../Buddy";
import {Room} from "../../Room";
import {MessageSent} from "../../MessageSent";
import {ChatPluginManager} from "../../../lib/plugin/ChatPluginManager";

export class MessageEventHandler implements ChatEventHandler {
  public getEventCode(): number {
    return MessageEvent.ID;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let messageEvent: MessageEvent = <MessageEvent> chatEvent;
    if (messageEvent.getType() === MessageType.CHAT) {
      if (messageEvent.getSender() === client.getSessionInfoProvider().getUsername()) {
        let dest = messageEvent.getDestination();
        let destBuddy = client.getBuddyList().getBuddyById(dest);
        if (destBuddy != null) {
          let destRoom = client.getRoomManager().getRoomById(dest);
          if (typeof destRoom === "undefined") {
            let roomPluginManager = new ChatPluginManager();
            destRoom = client.getRoomManager().createRoom(destBuddy.getId(), destBuddy.getNickname(), roomPluginManager);
            destRoom.addMember(destBuddy);
          }
          let messageSent = new MessageSent(
            messageEvent.getMessageId(),
            destBuddy.getId(),
            messageEvent.getDate(),
            messageEvent.getMessage()
          );
          destRoom.addMessageSentFromAnotherSession(messageSent);
        } else {
          client.Log.warn(messageEvent, "Received a message for a non-buddy");
        }
      } else {
        let origin: string = messageEvent.getSender();
        let originBuddy: Buddy = client.getBuddyList().getBuddyById(origin);
        let originRoom: Room = client.getRoomManager().getRoomById(origin);
        if (originBuddy != null) {
          if (typeof originRoom === "undefined") {
            let roomPluginManager = new ChatPluginManager();
            originRoom = client.getRoomManager().createRoom(originBuddy.getId(), originBuddy.getNickname(), roomPluginManager);
            originRoom.addMember(originBuddy);
          }
          let messageReceived: MessageReceived = new MessageReceived(
            messageEvent.getMessageId(),
            originBuddy,
            messageEvent.getDate(),
            messageEvent.getMessage()
          );
          originRoom.addMessageReceived(messageReceived);
          originRoom.addWritingStatusEvent(
            new MessageWritingStatus(
              originBuddy,
              client.getDateProvider().getNow(),
              WritingStatusEvent.RESET
            )
          );
          client.notifyMessageReceived(messageReceived);
        } else {
          client.Log.warn(messageEvent, "Received a message from a non-buddy");
        }
      }
    }
    return true;
  }
}
