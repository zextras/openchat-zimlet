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

import {BuddyStatus} from "../../../BuddyStatus";
import {BuddyStatusType} from "../../../BuddyStatusType";
import {IChatClient} from "../../../IChatClient";
import {FriendshipAcceptedEvent} from "../../chat/friendship/FriendshipAcceptedEvent";
import {IChatEventHandler} from "../IChatEventHandler";

export class FriendshipAcceptedHandler implements IChatEventHandler<FriendshipAcceptedEvent> {

  public getEventCode(): number {
    return FriendshipAcceptedEvent.TYPE;
  }

  public handleEvent(ev: FriendshipAcceptedEvent, client: IChatClient): boolean {
    const buddyList = client.getBuddyList();
    const buddy = buddyList.getBuddyById(ev.getSender());
    if (buddy != null) {
      buddy.setStatus(new BuddyStatus(BuddyStatusType.OFFLINE));
    }
    return true;
  }
}
