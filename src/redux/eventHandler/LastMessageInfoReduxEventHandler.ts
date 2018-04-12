/*
 * Copyright (C) 2018 ZeXtras S.r.l.
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

import {LastMessageInfoEvent} from "../../client/events/chat/LastMessageInfoEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {IRoomNotificationsCounterAction} from "../action/IRoomNotificationsCounterAction";
import {ISetLastUserMessageAction} from "../action/ISetLastUserMessageAction";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class LastMessageInfoReduxEventHandler extends ReduxEventHandler<LastMessageInfoEvent> {

  public getEventCode(): number {
    return OpenChatEventCode.LAST_MESSAGE_INFO;
  }

  public handleEvent(ev: LastMessageInfoEvent, client: IChatClient): boolean {
    if (ev.getUnreadCount() > 0) {
      this.mStore.dispatch<IRoomNotificationsCounterAction>({
        roomJid: ev.getSender(),
        type: "SET_ROOM_NOTIFICATION_COUNTER",
        value: ev.getUnreadCount(),
      });
    }

    if (ev.getLastIncomingMessageInfo() !== null || ev.getLastMessageSentInfo() !== null) {
      this.mStore.dispatch<ISetLastUserMessageAction>({
        jid: ev.getSender(),
        received: ev.getLastIncomingMessageInfo(),
        sent: ev.getLastMessageSentInfo(),
        type: "SET_LAST_USER_MESSAGES",
      });
    }
    return true;
  }

}
