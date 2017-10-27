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

import {BuddyList} from "../../../BuddyList";
import {BuddyStatusImp} from "../../../BuddyStatus";
import {BuddyStatusType} from "../../../BuddyStatusType";
import {IChatClient} from "../../../IChatClient";
import {FriendshipAcceptedEvent} from "../../chat/friendship/FriendshipAcceptedEvent";
import {ChatEvent} from "../../ChatEvent";
import {IChatEventHandler} from "../IChatEventHandler";

export class FriendshipAcceptedHandler implements IChatEventHandler {

  public getEventCode(): number {
    return FriendshipAcceptedEvent.TYPE;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const friendshipEvent = chatEvent as FriendshipAcceptedEvent;
    const buddyList = client.getBuddyList();
    const buddy = buddyList.getBuddyById(friendshipEvent.getSender());
    if (buddy != null) {
      buddy.setStatus(new BuddyStatusImp(BuddyStatusType.OFFLINE));
    }
    return true;
  }
}
