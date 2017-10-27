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

import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {RenameFriendshipEvent} from "../../../../events/chat/RenameFriendshipEvent";
import {ChatEvent} from "../../../../events/ChatEvent";
import {SoapEventEncoder} from "./SoapEventEncoder";

export class RenameFriendshipEventEncoder extends SoapEventEncoder {

  constructor() {
    super(OpenChatEventCode.RENAME_FRIENDSHIP);
  }

  protected getEventDetails(event: ChatEvent): {} {
    const ev: RenameFriendshipEvent = event as RenameFriendshipEvent;
    return {
      target_address: ev.getDestination(),
      target_group: ev.getGroup(),
      target_username: ev.getNickname(),
    };
  }

}
