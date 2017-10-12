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

import {ChatZimletBase} from "../../../../ChatZimletBase";
import {Buddy} from "../../../Buddy";
import {BuddyStatusImp} from "../../../BuddyStatus";
import {BuddyStatusType} from "../../../BuddyStatusType";
import {IBuddy} from "../../../IBuddy";
import {IChatClient} from "../../../IChatClient";
import {FriendshipInvitationEvent} from "../../chat/friendship/FriendshipInvitationEvent";
import {ChatEvent} from "../../ChatEvent";
import {IChatEventHandler} from "../IChatEventHandler";

export class FriendshipInvitationHandler implements IChatEventHandler {

  private mZimletContext: ChatZimletBase;

  constructor(zimletContext: ChatZimletBase) {
    this.mZimletContext = zimletContext;
  }

  public getEventCode(): number {
    return FriendshipInvitationEvent.TYPE;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const friendshipEvent = chatEvent as FriendshipInvitationEvent;
    const buddyList = client.getBuddyList();
    let buddy: IBuddy = buddyList.getBuddyById(friendshipEvent.getBuddyId());
    if (buddy == null) {
      buddy = new Buddy(friendshipEvent.getBuddyId(), friendshipEvent.getNickname());
      const defaultGroup = buddyList.getDefaultGroup();
      buddy.addGroup(defaultGroup);
      defaultGroup.addBuddy(buddy);
    }
    buddy.setStatus(new BuddyStatusImp(BuddyStatusType.NEED_RESPONSE));
    client.friendshipInvitationReceived(buddy);
    return true;
  }
}
