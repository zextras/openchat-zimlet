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
import {BuddyListEvent} from "../../../../events/chat/BuddyListEvent";
import {Group} from "../../../../Group";
import {Buddy} from "../../../../Buddy";
import {BuddyStatusImp} from "../../../../BuddyStatusImp";
import {DateProvider} from "../../../../../lib/DateProvider";
import {BuddyImp} from "../../../../BuddyImp";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";

export class BuddyListEventDecoder extends SoapEventDecoder {
  private mDateProvider: DateProvider;

  constructor(dateProvider: DateProvider) {
    super(OpenChatEventCode.BUDDY_LIST);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: {buddy_list: {id: string, nickname: string, group: string, statusType: number}[]}, originEvent?: ChatEvent): ChatEvent {
    let event: BuddyListEvent = new BuddyListEvent(this.mDateProvider.getNow()),
      groups: Group[] = [];

    for (let i: number = 0; i < eventObj["buddy_list"].length; i++) {
      let buddyData = eventObj["buddy_list"][i],
        group: Group = void 0;
      for (let j: number = 0; j < groups.length; j++) {
        if (groups[j].getName() === buddyData["group"]) {
          group = groups[j];
        }
      }
      if (typeof group === "undefined") {
        group = new Group(buddyData["group"]);
        groups.push(group);
      }
      let buddy: Buddy = new BuddyImp(
        buddyData["id"],
        buddyData["nickname"]
      );
      buddy.setStatus(
        new BuddyStatusImp(BuddyStatusImp.GetTypeFromNumber(buddyData["statusType"]))
      );
      buddy.addGroup(group);
      group.addBuddy(buddy, false);
      event.addBuddy(buddy);
    }

    return event;
  }

}
