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

import {ChatPluginManager} from "../../../lib/plugin/ChatPluginManager";
import {IBuddy} from "../../IBuddy";
import {IChatClient} from "../../IChatClient";
import {IRoom} from "../../IRoom";
import {MessageReceived} from "../../MessageReceived";
import {MessageSent} from "../../MessageSent";
import {MessageWritingStatus} from "../../MessageWritingStatus";
import {MessageEvent, MessageType} from "../chat/MessageEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {WritingStatusEvent} from "../chat/WritingStatusEvent";
import {ChatEvent} from "../ChatEvent";
import {IChatEventHandler} from "./IChatEventHandler";

export class MessageEventHandler implements IChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.MESSAGE;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const messageEvent: MessageEvent = chatEvent as MessageEvent;
    if (messageEvent.getType() === MessageType.CHAT) {
      if (messageEvent.getSender() === client.getSessionInfoProvider().getUsername()) {
        const dest = messageEvent.getDestination();
        const destBuddy = client.getBuddyList().getBuddyById(dest);
        if (destBuddy != null) {
          let destRoom = client.getRoomManager().getRoomById(dest);
          if (typeof destRoom === "undefined") {
            const roomPluginManager = new ChatPluginManager();
            destRoom = client.getRoomManager().createRoom(
              destBuddy.getId(),
              destBuddy.getNickname(),
              roomPluginManager,
              );
            destRoom.addMember(destBuddy);
          }
          const messageSent = new MessageSent(
            messageEvent.getMessageId(),
            destBuddy.getId(),
            messageEvent.getDate(),
            messageEvent.getMessage(),
          );
          destRoom.addMessageSentFromAnotherSession(messageSent);
        } else {
          client.Log.warn(messageEvent, "Received a message for a non-buddy");
        }
      } else {
        const origin: string = messageEvent.getSender();
        const originBuddy: IBuddy = client.getBuddyList().getBuddyById(origin);
        let originRoom: IRoom = client.getRoomManager().getRoomById(origin);
        if (originBuddy != null) {
          if (typeof originRoom === "undefined") {
            const roomPluginManager = new ChatPluginManager();
            originRoom = client.getRoomManager().createRoom(
              originBuddy.getId(),
              originBuddy.getNickname(),
              roomPluginManager,
            );
            originRoom.addMember(originBuddy);
          }
          const messageReceived: MessageReceived = new MessageReceived(
            messageEvent.getMessageId(),
            originBuddy,
            messageEvent.getDate(),
            messageEvent.getMessage(),
          );
          originRoom.addMessageReceived(messageReceived);
          originRoom.addWritingStatusEvent(
            new MessageWritingStatus(
              originBuddy,
              client.getDateProvider().getNow(),
              WritingStatusEvent.RESET,
            ),
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
