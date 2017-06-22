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
import {FriendBackAddedEvent} from "../../../../events/chat/FriendBackAddedEvent";
import {Buddy} from "../../../../Buddy";
import {BuddyStatusType} from "../../../../BuddyStatusType";
import {BuddyStatus} from "../../../../BuddyStatus";
import {DateProvider} from "../../../../../lib/DateProvider";
import {BuddyImp} from "../../../../BuddyImp";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";

export class FriendBackAddedEventDecoder extends SoapEventDecoder {
  private mDateProvider: DateProvider;

  constructor(dateProvider: DateProvider) {
    super(OpenChatEventCode.FRIEND_BACK_ADDED);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: {
      buddyAddress: string
      buddyNickname: string
    },
    originEvent?: ChatEvent
  ): ChatEvent {
    let buddy: Buddy = new BuddyImp(
      eventObj["buddyAddress"],
      eventObj["buddyNickname"]
    );
    buddy.setStatus(
      new BuddyStatus(BuddyStatusType.INVITED)
    );
    return new FriendBackAddedEvent(buddy, this.mDateProvider.getNow());
  }

}
