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

import {Version} from "../../../lib/Version";
import {IChatClient} from "../../IChatClient";
import {EventSessionRegistered} from "../chat/EventSessionRegistered";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {ChatEvent} from "../ChatEvent";
import {IChatEventHandler} from "./IChatEventHandler";

export class EventSessionRegisteredHandler implements IChatEventHandler {
  public getEventCode(): number {
    return OpenChatEventCode.REGISTER_SESSION;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    if ((chatEvent != null) && typeof chatEvent !== "undefined") {
      const eventSessionRegistered: EventSessionRegistered = chatEvent as EventSessionRegistered;
      client.getSessionInfoProvider().resetSessionResponsesReceived();
      client.getSessionInfoProvider().setSessionId(eventSessionRegistered.getInfo("session_id"));
      client.getSessionInfoProvider().setServerVersion(new Version(eventSessionRegistered.getInfo("server_version")));
      client.getSessionInfoProvider().setRoomServiceAddress(eventSessionRegistered.getInfo("room_service_address"));
      client.getSessionInfoProvider().setProduct(eventSessionRegistered.getInfo("product"));

      client.serverOnline(eventSessionRegistered);
      client.startPing();
    }
    return true;
  }
}
