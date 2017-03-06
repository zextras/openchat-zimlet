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

import {FriendshipBlockedEvent} from "../../chat/friendship/FriendshipBlockedEvent";
import {ChatClient} from "../../../ChatClient";
import {ChatEventHandler} from "../ChatEventHandler";
import {ChatEvent} from "../../ChatEvent";

export class FriendshipBlockedHandler implements ChatEventHandler {

  public getEventCode(): number {
    return FriendshipBlockedEvent.TYPE;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let friendshipEvent = <FriendshipBlockedEvent> chatEvent;
    client.Log.warn(event, "Event deprecated");
    return true;
  }
}