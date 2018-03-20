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

import {BuddyList} from "../../BuddyList";
import {IUserCapabilities} from "../../connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {Group} from "../../Group";
import {IBuddy} from "../../IBuddy";
import {IChatClient} from "../../IChatClient";
import {FriendBackAddedEvent} from "../chat/FriendBackAddedEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {IChatEventHandler} from "./IChatEventHandler";

export class FriendBackAddedEventHandler<T extends IUserCapabilities>
  implements IChatEventHandler<FriendBackAddedEvent<T>> {

  public getEventCode(): number {
    return OpenChatEventCode.FRIEND_BACK_ADDED;
  }

  public handleEvent(chatEvent: FriendBackAddedEvent<T>, client: IChatClient): boolean {
    const buddy: IBuddy = chatEvent.getBuddy();
    const oldBuddy: IBuddy = client.getBuddyList().getBuddyById(buddy.getId());
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
