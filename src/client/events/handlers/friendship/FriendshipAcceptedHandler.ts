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

import {FriendshipAcceptedEvent} from "../../chat/friendship/FriendshipAcceptedEvent";
import {ChatClient} from "../../../ChatClient";
import {BuddyStatusType} from "../../../BuddyStatusType";
import {BuddyStatusImp} from "../../../BuddyStatusImp";
import {ChatEvent} from "../../ChatEvent";
import {ChatEventHandler} from "../ChatEventHandler";

export class FriendshipAcceptedHandler implements ChatEventHandler {

  public getEventCode(): number {
    return FriendshipAcceptedEvent.TYPE;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let friendshipEvent = <FriendshipAcceptedEvent> chatEvent,
      buddyList = client.getBuddyList(),
      buddy = buddyList.getBuddyById(friendshipEvent.getSender());
    if (buddy != null) {
      buddy.setStatus(new BuddyStatusImp(BuddyStatusType.OFFLINE));
    }
    return true;
  }
}