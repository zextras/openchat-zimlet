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

import {SoapEventDecoder} from "./SoapEventDecoder";
import {ChatEvent} from "../../../../events/ChatEvent";
import {EventSessionRegistered} from "../../../../events/chat/EventSessionRegistered";
import {Version} from "../../../../../lib/Version";
import {DateProvider} from "../../../../../lib/DateProvider";

export class SessionRegisteredEventDecoder extends SoapEventDecoder {
  private mDateProvider: DateProvider;

  constructor(dateProvider: DateProvider) {
    super(EventSessionRegistered.ID);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: {
      session_id: string,
      server_version: string,
      required_zimlet_version: string,
      history_enabled: boolean,
      remove_brand: boolean,
      videochat_enabled: boolean,
      silent_error_reporting_enabled: boolean,
      room_service_address: string
    },
    originEvent?: ChatEvent
  ): ChatEvent {
    return new EventSessionRegistered(
      eventObj["session_id"],
      new Version("" + eventObj["server_version"]),
      new Version("" + eventObj["required_zimlet_version"]),
      eventObj["history_enabled"],
      eventObj["remove_brand"],
      eventObj["videochat_enabled"],
      eventObj["silent_error_reporting_enabled"],
      eventObj["room_service_address"],
      this.mDateProvider.getNow()
    );
  }

}
