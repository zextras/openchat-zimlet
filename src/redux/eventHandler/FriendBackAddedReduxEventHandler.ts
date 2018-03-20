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

import {IUserCapabilities} from "../../client/connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {FriendBackAddedEvent} from "../../client/events/chat/FriendBackAddedEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IBuddy} from "../../client/IBuddy";
import {IChatClient} from "../../client/IChatClient";
import {IBuddyListAction} from "../action/IBuddyListAction";
import {IOpenChatBuddyListMap, IOpenChatBuddyStatus} from "../IOpenChatState";
import {BuddyStatusInitialState} from "../OpenChatInitialState";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class FriendBackAddedReduxEventHandler<T extends IUserCapabilities>
  extends ReduxEventHandler<FriendBackAddedEvent<T>> {

  public getEventCode(): number {
    return OpenChatEventCode.FRIEND_BACK_ADDED;
  }

  public handleEvent(ev: FriendBackAddedEvent<T>, client: IChatClient): boolean {
    const buddy: IBuddy = ev.getBuddy();
    const buddyStatuses: {[resource: string]: IOpenChatBuddyStatus} = {};
    buddyStatuses[BuddyStatusInitialState.resource] = {
      ...BuddyStatusInitialState,
      type: buddy.getStatus().getType(),
    };
    const buddies: IOpenChatBuddyListMap = {};
    buddies[buddy.getId()] = {
      capabilities: ev.getCapabilities(),
      groups: [],
      jid: buddy.getId(),
      nickname: buddy.getNickname(),
      statuses: buddyStatuses,
      type: "buddy",
    };
    this.mStore.dispatch<IBuddyListAction>({
      buddies: buddies,
      type: "POPULATE_BUDDY_LIST",
    });
    return true;
  }
}
