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

import {IBuddy} from "../../../IBuddy";
import {IChatClient} from "../../../IChatClient";
import {FriendshipRemovedEvent} from "../../chat/friendship/FriendshipRemovedEvent";
import {ChatEvent} from "../../ChatEvent";
import {IChatEventHandler} from "../IChatEventHandler";

export class FriendshipRemovedHandler implements IChatEventHandler {

  public getEventCode(): number {
    return FriendshipRemovedEvent.TYPE;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const friendshipEvent = chatEvent as FriendshipRemovedEvent;
    const buddyList = client.getBuddyList();
    const buddy: IBuddy = buddyList.getBuddyById(friendshipEvent.getSender());
    if (buddy != null) {
      buddyList.removeBuddy(buddy);
    }
    return true;
  }
}
