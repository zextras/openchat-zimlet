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
import {TimeoutEvent} from "../../client/events/chat/TimeoutEvent";
import {IChatClient} from "../../client/IChatClient";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class TimeoutReduxEventHandler extends ReduxEventHandler<TimeoutEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.TIMEOUT;
  }

  public handleEvent(ev: TimeoutEvent, client: IChatClient): boolean {
    // client.Log.warn(undefined, "Ping requested timed out.");
    return true;
  }
}
