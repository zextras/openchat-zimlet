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

import {SoapEventEncoder} from "./SoapEventEncoder";
import {ChatEvent} from "../../../../events/ChatEvent";
import {FriendshipEvent} from "../../../../events/chat/FriendshipEvent";
import {FriendshipInvitationEvent} from "../../../../events/chat/friendship/FriendshipInvitationEvent";

export class FriendshipEventEncoder extends SoapEventEncoder {

  constructor() {
    super(FriendshipEvent.ID);
  }

  protected getEventDetails(event: ChatEvent): {} {

    if ((<FriendshipEvent> event).getFriendshipStatus() === FriendshipInvitationEvent.TYPE) {
      // Add Friendship
      let ev: FriendshipInvitationEvent = <FriendshipInvitationEvent> event;
      return {
        target_address: ev.getDestination(),
        target_username: ev.getNickname(),
        group: ev.getGroup()
      };
    }

    return {};
  }

}
