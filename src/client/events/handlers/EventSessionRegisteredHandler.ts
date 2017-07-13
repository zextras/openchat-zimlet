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
import {EventSessionRegistered} from "../chat/EventSessionRegistered";
import {Version} from "../../../lib/Version";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";

export class EventSessionRegisteredHandler implements ChatEventHandler {
  public getEventCode(): number {
    return OpenChatEventCode.REGISTER_SESSION;
  }

  handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    if ((chatEvent != null) && typeof chatEvent !== "undefined") {
      let eventSessionRegistered: EventSessionRegistered = <EventSessionRegistered> chatEvent;
      client.getSessionInfoProvider().resetSessionResponsesReceived();
      client.getSessionInfoProvider().setSessionId(eventSessionRegistered.getInfo("session_id"));
      client.getSessionInfoProvider().setServerVersion(new Version(eventSessionRegistered.getInfo("server_version")));
      client.getSessionInfoProvider().setRoomServiceAddress(eventSessionRegistered.getInfo("room_service_address"));

      client.serverOnline(eventSessionRegistered);
      client.startPing();
    }
    return true;
  }
}
