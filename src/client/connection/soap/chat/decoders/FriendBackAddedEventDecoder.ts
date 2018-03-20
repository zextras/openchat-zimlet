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

import {IDateProvider} from "../../../../../lib/IDateProvider";
import {Buddy} from "../../../../Buddy";
import {BuddyStatus} from "../../../../BuddyStatus";
import {BuddyStatusType} from "../../../../BuddyStatusType";
import {FriendBackAddedEvent} from "../../../../events/chat/FriendBackAddedEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {IBuddy} from "../../../../IBuddy";
import {ISoapEventObject} from "../SoapEventParser";
import {IUserCapabilities} from "./SessionRegisteredEventDecoder";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class FriendBackAddedEventDecoder<T extends IUserCapabilities>
  extends SoapEventDecoder<FriendBackAddedEvent<T>> {

  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.FRIEND_BACK_ADDED);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: IFriendBackAddedEventObj<T>,
    originEvent?: IChatEvent,
  ): FriendBackAddedEvent<T> {
    const buddy: IBuddy = new Buddy(
      eventObj.buddyAddress,
      eventObj.buddyNickname,
    );
    buddy.setStatus(
      new BuddyStatus(BuddyStatusType.INVITED),
    );
    return new FriendBackAddedEvent<T>(buddy, eventObj.capabilities, this.mDateProvider.getNow());
  }

}

interface IFriendBackAddedEventObj<T extends IUserCapabilities> extends ISoapEventObject {
  buddyAddress: string;
  buddyNickname: string;
  capabilities: T;
}
