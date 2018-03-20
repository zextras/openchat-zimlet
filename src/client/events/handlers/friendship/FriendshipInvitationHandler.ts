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

import {Buddy} from "../../../Buddy";
import {BuddyStatus} from "../../../BuddyStatus";
import {BuddyStatusType} from "../../../BuddyStatusType";
import {IBuddy} from "../../../IBuddy";
import {IChatClient} from "../../../IChatClient";
import {FriendshipInvitationEvent} from "../../chat/friendship/FriendshipInvitationEvent";
import {IChatEventHandler} from "../IChatEventHandler";

export class FriendshipInvitationHandler implements IChatEventHandler<FriendshipInvitationEvent> {

  constructor() {}

  public getEventCode(): number {
    return FriendshipInvitationEvent.TYPE;
  }

  public handleEvent(ev: FriendshipInvitationEvent, client: IChatClient): boolean {
    const buddyList = client.getBuddyList();
    let buddy: IBuddy = buddyList.getBuddyById(ev.getBuddyId());
    if (buddy == null) {
      buddy = new Buddy(ev.getBuddyId(), ev.getNickname());
      const defaultGroup = buddyList.getDefaultGroup();
      buddy.addGroup(defaultGroup);
      defaultGroup.addBuddy(buddy);
    }
    buddy.setStatus(new BuddyStatus(BuddyStatusType.NEED_RESPONSE));
    client.friendshipInvitationReceived(buddy);
    return true;
  }
}
