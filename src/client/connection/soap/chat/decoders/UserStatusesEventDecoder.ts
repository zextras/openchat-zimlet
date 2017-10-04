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

import {DateProvider} from "../../../../../lib/DateProvider";
import {IBuddyStatus} from "../../../../IBuddyStatus";
import {BuddyStatusImp} from "../../../../BuddyStatus";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {UserStatusesEvent} from "../../../../events/chat/UserStatusesEvent";
import {ChatEvent} from "../../../../events/ChatEvent";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class UserStatusesEventDecoder extends SoapEventDecoder {
  private static decodeBuddyStatus(status: IUserStatusObj): IBuddyStatus {
    return new BuddyStatusImp(
      BuddyStatusImp.GetTypeFromNumber(status.type),
      status.message,
      status.id,
    );
  }

  private mDateProvider: DateProvider;

  constructor(dateProvider: DateProvider) {
    super(OpenChatEventCode.USER_STATUSES);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: {user_statuses: IUserStatusObj[]}, originEvent?: ChatEvent): ChatEvent {
    const event: UserStatusesEvent = new UserStatusesEvent(this.mDateProvider.getNow());
    const statuses: IUserStatusObj[] = eventObj.user_statuses;
    for (const status of statuses) {
      event.addStatus(UserStatusesEventDecoder.decodeBuddyStatus(status));
    }
    return event;
  }
}

interface IUserStatusObj {
  type: number;
  message: string;
  id: number;
}
