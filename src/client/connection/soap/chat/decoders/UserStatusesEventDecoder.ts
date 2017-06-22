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
import {DateProvider} from "../../../../../lib/DateProvider";
import {UserStatusesEvent} from "../../../../events/chat/UserStatusesEvent";
import {ChatEvent} from "../../../../events/ChatEvent";
import {BuddyStatus} from "../../../../BuddyStatus";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";

export class UserStatusesEventDecoder extends SoapEventDecoder {
  private mDateProvider: DateProvider;

  constructor(dateProvider: DateProvider) {
    super(OpenChatEventCode.USER_STATUSES);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: {user_statuses: UserStatusObj[]}, originEvent?: ChatEvent): ChatEvent {
    let event: UserStatusesEvent = new UserStatusesEvent(this.mDateProvider.getNow()),
      statuses: UserStatusObj[] = eventObj["user_statuses"];
    for (let i: number = 0; i < statuses.length; i++) {
      event.addStatus(UserStatusesEventDecoder.decodeBuddyStatus(statuses[i]));
    }
    return event;
  }

  private static decodeBuddyStatus(status: UserStatusObj): BuddyStatus {
    return new BuddyStatus(
      BuddyStatus.GetTypeFromNumber(status["type"]),
      status["message"],
      status["id"]
    );
  }
}

interface UserStatusObj {
  type: number;
  message: string;
  id: number;
}
