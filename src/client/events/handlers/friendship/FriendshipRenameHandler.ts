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

import {Group} from "../../../Group";
import {IBuddy} from "../../../IBuddy";
import {IChatClient} from "../../../IChatClient";
import {FriendshipRenameEvent} from "../../chat/friendship/FriendshipRenameEvent";
import {IChatEventHandler} from "../IChatEventHandler";

export class FriendshipRenameHandler implements IChatEventHandler<FriendshipRenameEvent> {

  public getEventCode(): number {
    return FriendshipRenameEvent.TYPE;
  }

  public handleEvent(ev: FriendshipRenameEvent, client: IChatClient): boolean {
    const buddyList = client.getBuddyList();
    const buddy: IBuddy = buddyList.getBuddyById(ev.getSender());
    if (buddy != null) {
      if (buddy.getNickname() !== ev.getNickname()) {
        buddy.setNickname(ev.getNickname());
      }
      let group = buddyList.getGroup(ev.getGroup());
      if (group == null) {
        group = new Group(ev.getGroup());
        buddyList.addGroup(group);
      }
      let needToBeAdded = true;
      const removeFrom = [];
      for (const buddyGroup of buddy.getGroups()) {
        if (buddyGroup.getName() === ev.getGroup()) {
          needToBeAdded = false;
        } else {
          removeFrom.push(buddyGroup);
        }
      }
      for (const buddyGroup of removeFrom) {
        buddyGroup.removeBuddy(buddy);
        buddy.removeGroup(buddyGroup.getName());
      }
      if (needToBeAdded) {
        buddy.addGroup(group);
        group.addBuddy(buddy);
      }
    }
    return true;
  }
}
