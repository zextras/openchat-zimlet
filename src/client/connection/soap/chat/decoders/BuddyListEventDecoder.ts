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
import {BuddyListEvent} from "../../../../events/chat/BuddyListEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {ChatEvent} from "../../../../events/ChatEvent";
import {Group} from "../../../../Group";
import {IBuddy} from "../../../../IBuddy";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class BuddyListEventDecoder extends SoapEventDecoder {
  private mDateProvider: DateProvider;

  constructor(dateProvider: DateProvider) {
    super(OpenChatEventCode.BUDDY_LIST);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: {
      buddy_list: Array<{
        group: string,
        id: string,
        nickname: string,
        statusType: number,
      }>,
    },
    originEvent?: ChatEvent,
  ): ChatEvent {
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
        new BuddyStatusImp(BuddyStatusImp.GetTypeFromNumber(buddyData.statusType)),
      );
      buddy.addGroup(tmpGroup);
      tmpGroup.addBuddy(buddy, false);
      event.addBuddy(buddy);
    }

    return event;
  }

}
