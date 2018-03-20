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
import {BuddyListEvent} from "../../../../events/chat/BuddyListEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {Group} from "../../../../Group";
import {IBuddy} from "../../../../IBuddy";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class BuddyListEventDecoder extends SoapEventDecoder<BuddyListEvent> {
  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.BUDDY_LIST);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: IBuddyListEventObj,
    originEvent?: IChatEvent,
  ): BuddyListEvent {
    const event: BuddyListEvent = new BuddyListEvent(this.mDateProvider.getNow());
    const groups: Group[] = [];

    for (const buddyData of eventObj.buddy_list) {
      let tmpGroup: Group = void 0;
      for (const group of groups) {
        if (group.getName() === buddyData.group) {
          tmpGroup = group;
        }
      }
      if (typeof tmpGroup === "undefined") {
        tmpGroup = new Group(buddyData.group);
        groups.push(tmpGroup);
      }
      const buddy: IBuddy = new Buddy(
        buddyData.id,
        buddyData.nickname,
      );
      buddy.setStatus(
        new BuddyStatus(BuddyStatus.GetTypeFromNumber(buddyData.statusType)),
      );
      buddy.addGroup(tmpGroup);
      tmpGroup.addBuddy(buddy, false);
      event.addBuddy(buddy);
    }

    return event;
  }

}

interface IBuddyListEventObj extends ISoapEventObject {
  buddy_list: Array<{
    group: string,
    id: string,
    nickname: string,
    statusType: number,
  }>;
}
