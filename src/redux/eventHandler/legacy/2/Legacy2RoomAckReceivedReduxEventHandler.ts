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

import {Legacy2RoomAckReceivedEvent} from "../../../../client/events/chat/legacy/2/Legacy2RoomAckReceivedEvent";
import {OpenChatEventCode} from "../../../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../../../client/IChatClient";
import {ISetRoomAckAction} from "../../../action/ISetRoomAckAction";
import {IOpenChatState} from "../../../IOpenChatState";
import {ReduxEventHandler} from "../../ReduxEventHandler";

export class Legacy2RoomAckReceivedReduxEventHandler extends ReduxEventHandler<Legacy2RoomAckReceivedEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.ROOM_ACK;
  }

  public handleEvent(ev: Legacy2RoomAckReceivedEvent, client: IChatClient): boolean {
    const state: IOpenChatState = this.mStore.getState();
    const me: string = state.sessionInfo.username;
    // Ignore my acks
    if (ev.getSender() === me || ev.getSenderResource() === me) { return true; }
    if (state.rooms.hasOwnProperty(ev.getSender())) {
      for (const msg of state.rooms[ev.getSender()].messages) {
        if (msg.id === ev.getMessageId()) {
          this.mStore.dispatch<ISetRoomAckAction>({
            jid: ev.getSenderWithResource(),
            message_id: msg.id,
            message_time: msg.date,
            type: "SET_ROOM_ACK",
          });
          break;
        }
      }
    }
    return true;
  }
}
