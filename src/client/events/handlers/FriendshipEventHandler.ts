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

import {IChatClient} from "../../IChatClient";
import {FriendshipEvent} from "../chat/FriendshipEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {ChatEvent} from "../ChatEvent";
import {EventManager} from "../EventManager";
import {IChatEventHandler} from "./IChatEventHandler";

export class FriendshipEventHandler extends EventManager implements IChatEventHandler {

  constructor(...subHandlers: IChatEventHandler[]) {
    super();
    for (const handler of subHandlers) {
      this.addEventHandler(handler);
    }
  }

  public getEventCode(): number {
    return OpenChatEventCode.FRIENDSHIP;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const friendshipEvent: FriendshipEvent = chatEvent as FriendshipEvent;
    let handled: boolean = false;
    if (this.mHandlersMap.hasOwnProperty(friendshipEvent.getFriendshipStatus().toString())) {
      for (const handler of this.mHandlersMap[friendshipEvent.getFriendshipStatus()]) {
        handled = handler.handleEvent(friendshipEvent, client);
      }
    }
    return true;
  }

}
