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
import {FriendBackAddedEvent} from "../chat/FriendBackAddedEvent";
import {ChatEvent} from "../ChatEvent";
import {ChatClient} from "../../ChatClient";
import {Buddy} from "../../Buddy";
import {BuddyList} from "../../BuddyList";
import {Group} from "../../Group";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";

export class FriendBackAddedEventHandler implements ChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.FRIEND_BACK_ADDED;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let friendBackAddedEvent: FriendBackAddedEvent = <FriendBackAddedEvent> chatEvent;
    let buddy: Buddy = friendBackAddedEvent.getBuddy();
    let oldBuddy: Buddy = client.getBuddyList().getBuddyById(buddy.getId());
    if ((oldBuddy != null) && typeof oldBuddy !== "undefined") {
      oldBuddy.setStatus(buddy.getStatus());
    } else {
      if (buddy.getGroups().length === 0) {
        buddy.addGroup(new Group(BuddyList.DEFAULT_GROUP_NAME));
      }
      client.getBuddyList().updateOrAddBuddy(buddy);
    }
    return true;
  }
}
