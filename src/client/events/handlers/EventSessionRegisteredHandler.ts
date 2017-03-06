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

export class EventSessionRegisteredHandler implements ChatEventHandler {
  public getEventCode(): number {
    return EventSessionRegistered.ID;
  }

  handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    if ((chatEvent != null) && typeof chatEvent !== "undefined") {
      let eventSessionRegistered: EventSessionRegistered = <EventSessionRegistered> chatEvent;
      client.getSessionInfoProvider().setServerVersion(eventSessionRegistered.getServerVersion());
      client.getSessionInfoProvider().setSessionId(eventSessionRegistered.getSessionId());
      // client.getSessionInfoProvider().setHistoryEnabled(eventSessionRegistered.getHistoryEnabled());
      // client.getSessionInfoProvider().setReBranded(eventSessionRegistered.getNoBrand());
      client.getSessionInfoProvider().enableSilentErrorReporting(eventSessionRegistered.isSilentErrorReportingEnabled());
      client.getSessionInfoProvider().setRoomServiceAddress(eventSessionRegistered.getRoomServiceAddress());

      client.serverOnline(eventSessionRegistered);
      client.startPing();
    }
    return true;
  }
}
