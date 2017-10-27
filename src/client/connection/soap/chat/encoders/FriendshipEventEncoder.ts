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

import {FriendshipInvitationEvent} from "../../../../events/chat/friendship/FriendshipInvitationEvent";
import {FriendshipEvent} from "../../../../events/chat/FriendshipEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {ChatEvent} from "../../../../events/ChatEvent";
import {SoapEventEncoder} from "./SoapEventEncoder";

export class FriendshipEventEncoder extends SoapEventEncoder {

  constructor() {
    super(OpenChatEventCode.FRIENDSHIP);
  }

  protected getEventDetails(event: ChatEvent): {} {

    if ((event as FriendshipEvent).getFriendshipStatus() === FriendshipInvitationEvent.TYPE) {
      // Add Friendship
      const ev: FriendshipInvitationEvent = event as FriendshipInvitationEvent;
      return {
        group: ev.getGroup(),
        target_address: ev.getDestination(),
        target_username: ev.getNickname(),
      };
    }

    return {};
  }

}
