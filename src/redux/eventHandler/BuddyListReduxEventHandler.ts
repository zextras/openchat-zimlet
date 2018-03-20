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

import {BuddyListEvent} from "../../client/events/chat/BuddyListEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IBuddy} from "../../client/IBuddy";
import {IChatClient} from "../../client/IChatClient";
import {IBuddyListAction} from "../action/IBuddyListAction";
import {IOpenChatBuddyListMap} from "../IOpenChatState";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class BuddyListReduxEventHandler extends ReduxEventHandler<BuddyListEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.BUDDY_LIST;
  }

  public handleEvent(ev: BuddyListEvent, client: IChatClient): boolean {
    this.mStore.dispatch<IBuddyListAction>({
      type: "RESET_BUDDY_LIST",
    });

    const rcvBuddies: IBuddy[] = ev.getBuddies();
    const newBuddies: IOpenChatBuddyListMap = {};
    for (const buddy of rcvBuddies) {
      newBuddies[buddy.getId()] = {
        capabilities: {},
        groups: [],
        jid: buddy.getId(),
        nickname: buddy.getNickname(),
        statuses: {
          default: {
            message: "",
            resource: "default",
            type: buddy.getStatus().getType(),
          },
        },
        type: "buddy",
      };
    }

    this.mStore.dispatch<IBuddyListAction>({
      buddies: newBuddies,
      type: "POPULATE_BUDDY_LIST",
    });
    return true;
  }
}
