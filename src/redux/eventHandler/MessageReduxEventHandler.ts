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

import {MessageEvent} from "../../client/events/chat/MessageEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {IAddMessageToRoomAction} from "../action/IAddMessageToRoomAction";
import {IRoomAction} from "../action/IRoomAction";
import {ISetLastUserMessageAction} from "../action/ISetLastUserMessageAction";
import {IOpenChatTextMessage} from "../IOpenChatState";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class MessageReduxEventHandler extends ReduxEventHandler<MessageEvent> {

  public getEventCode(): number {
    return OpenChatEventCode.MESSAGE;
  }

  public handleEvent(ev: MessageEvent, client: IChatClient): boolean {
    if (ev.getType().toLowerCase() === "chat") {
      let roomJid: string = ev.getSender();
      if (ev.getSender() === this.mStore.getState().sessionInfo.username) {
        // add own message from another session
        roomJid = ev.getDestination();
      } else {
        // TODO: Remove the SET_WRITING_STATUS from here, is not working properly.
        this.mStore.dispatch<IRoomAction>({
          jid: roomJid,
          type: "SET_WRITING_STATUS",
          writingStatus: "reset",
        });
      }
      this.mStore.dispatch<IAddMessageToRoomAction<IOpenChatTextMessage>>({
        jid: roomJid,
        message: {
          content: ev.getMessage(),
          date: ev.getDate(),
          destination: ev.getDestination(),
          id: ev.getMessageId(),
          roomType: ev.getType().toLowerCase(),
          sender: ev.getSender(),
          type: "message",
        },
        type: "ADD_MESSAGE_TO_ROOM",
      });
      this.mStore.dispatch<ISetLastUserMessageAction>({
        buddyJid: roomJid,
        received: {
          date: ev.getDate(),
          id: ev.getMessageId(),
        },
        type: "SET_LAST_USER_MESSAGES",
      });
    }
    return true;
  }
}
