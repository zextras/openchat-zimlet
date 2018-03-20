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

import {ArchiveCounterEvent} from "../../client/events/chat/ArchiveCounterEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {IRoomNotificationsCounterAction} from "../action/IRoomNotificationsCounterAction";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class ArchiveCountReduxEventHandler extends ReduxEventHandler<ArchiveCounterEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.ARCHIVE_COUNTER;
  }

  public handleEvent(ev: ArchiveCounterEvent, client: IChatClient): boolean {
    this.mStore.dispatch<IRoomNotificationsCounterAction>({
      roomJid: ev.getSender(),
      type: "SET_ROOM_NOTIFICATION_COUNTER",
      value: ev.getCount(),
    });
    return true;
  }
}
