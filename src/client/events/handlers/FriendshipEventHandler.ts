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

import {ChatEvent} from "../ChatEvent";
import {ChatClient} from "../../ChatClient";
import {FriendshipEvent} from "../chat/FriendshipEvent";
import {EventManager} from "../EventManager";
import {ChatEventHandler} from "./ChatEventHandler";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";

export class FriendshipEventHandler extends EventManager implements ChatEventHandler {

  constructor(...subHandlers: ChatEventHandler[]) {
    super();
    for (let handler of subHandlers) {
      this.addEventHandler(handler);
    }
  }

  public getEventCode(): number {
    return OpenChatEventCode.FRIENDSHIP;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let friendshipEvent: FriendshipEvent = <FriendshipEvent> chatEvent,
      handled: boolean = false;
    if (this.mHandlersMap.hasOwnProperty(friendshipEvent.getFriendshipStatus().toString())) {
      for (let handler of this.mHandlersMap[friendshipEvent.getFriendshipStatus()]) {
        handled = handler.handleEvent(friendshipEvent, client);
      }
    }
    return true;
  }

}