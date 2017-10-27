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
import {Buddy} from "../../../../Buddy";
import {BuddyStatusImp} from "../../../../BuddyStatus";
import {BuddyStatusType} from "../../../../BuddyStatusType";
import {FriendBackAddedEvent} from "../../../../events/chat/FriendBackAddedEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {ChatEvent} from "../../../../events/ChatEvent";
import {IBuddy} from "../../../../IBuddy";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class FriendBackAddedEventDecoder extends SoapEventDecoder {
  private mDateProvider: DateProvider;

  constructor(dateProvider: DateProvider) {
    super(OpenChatEventCode.FRIEND_BACK_ADDED);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: {
      buddyAddress: string,
      buddyNickname: string,
    },
    originEvent?: ChatEvent,
  ): ChatEvent {
    const buddy: IBuddy = new Buddy(
      eventObj.buddyAddress,
      eventObj.buddyNickname,
    );
    buddy.setStatus(
      new BuddyStatusImp(BuddyStatusType.INVITED),
    );
    return new FriendBackAddedEvent(buddy, this.mDateProvider.getNow());
  }

}
