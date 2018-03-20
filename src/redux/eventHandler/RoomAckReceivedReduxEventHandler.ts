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

import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {RoomAckReceivedEvent} from "../../client/events/chat/RoomAckReceivedEvent";
import {IChatClient} from "../../client/IChatClient";
import {ISetRoomAckAction} from "../action/ISetRoomAckAction";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class RoomAckReceivedReduxEventHandler extends ReduxEventHandler<RoomAckReceivedEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.ROOM_ACK;
  }

  public handleEvent(ev: RoomAckReceivedEvent, client: IChatClient): boolean {
    const me: string = this.mStore.getState().sessionInfo.username;
    // Ignore my acks
    if (ev.getSender() === me || ev.getSenderResource() === me) { return true; }
    this.mStore.dispatch<ISetRoomAckAction>({
      jid: ev.getSenderWithResource(),
      message_id: ev.getMessageId(),
      message_time: ev.getCreationDate(),
      type: "SET_ROOM_ACK",
    });
    return true;
  }
}
