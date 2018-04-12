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

import {BuddyStatusType} from "../../client/BuddyStatusType";
import {FriendshipAcceptedEvent} from "../../client/events/chat/friendship/FriendshipAcceptedEvent";
import {FriendshipBlockedEvent} from "../../client/events/chat/friendship/FriendshipBlockedEvent";
import {FriendshipDeniedEvent} from "../../client/events/chat/friendship/FriendshipDeniedEvent";
import {FriendshipInvitationEvent} from "../../client/events/chat/friendship/FriendshipInvitationEvent";
import {FriendshipRemovedEvent} from "../../client/events/chat/friendship/FriendshipRemovedEvent";
import {FriendshipRenameEvent} from "../../client/events/chat/friendship/FriendshipRenameEvent";
import {FriendshipEvent} from "../../client/events/chat/FriendshipEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {IBuddyAction} from "../action/IBuddyAction";
import {IBuddyListAction} from "../action/IBuddyListAction";
import {IOpenChatBuddyListMap} from "../IOpenChatState";
import {BuddyInitialState} from "../OpenChatInitialState";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class FriendshipReduxEventHandler extends ReduxEventHandler<FriendshipEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.FRIENDSHIP;
  }

  public handleEvent(ev: FriendshipEvent, client: IChatClient): boolean {
    switch (ev.getFriendshipStatus()) {
      case FriendshipAcceptedEvent.TYPE:
        this.mStore.dispatch<IBuddyAction>({
          buddyJid: ev.getSender(),
          status: {
            message: "",
            resource: ev.getSenderResource(),
            type: BuddyStatusType.OFFLINE,
          },
          type: "ADD_OR_UPDATE_STATUS_TO_BUDDY",
        });
        break;

      case FriendshipInvitationEvent.TYPE:
        const buddies: IOpenChatBuddyListMap = {};
        buddies[(ev as FriendshipInvitationEvent).getBuddyId()] = {
          capabilities: {},
          groups: [],
          jid: (ev as FriendshipInvitationEvent).getBuddyId(),
          lastMessageReceived: null,
          lastMessageSent: null,
          nickname: (ev as FriendshipInvitationEvent).getNickname(),
          statuses: {
            default: {
              message: "",
              resource: "default",
              type: BuddyStatusType.NEED_RESPONSE,
            },
          },
          type: "buddy",
        };

        this.mStore.dispatch<IBuddyListAction>({
          buddies: buddies,
          type: "POPULATE_BUDDY_LIST",
        });
        // client.friendshipInvitationReceived(buddy);
        break;

      case FriendshipRemovedEvent.TYPE:
        const action: IBuddyListAction = {
          buddies: {},
          type: "REMOVE_BUDDIES_FROM_BUDDY_LIST",
        };
        action.buddies[ev.getSender()] = {
          ...BuddyInitialState,
          jid: ev.getSender(),
        };
        this.mStore.dispatch<IBuddyListAction>(action);
        break;

      case FriendshipRenameEvent.TYPE:
        this.mStore.dispatch<IBuddyAction>({
          buddyJid: ev.getSender(),
          group: (ev as FriendshipRenameEvent).getGroup(),
          nickname: (ev as FriendshipRenameEvent).getNickname(),
          type: "SET_NICKNAME",
        });
        break;

      case FriendshipBlockedEvent.TYPE:
      case FriendshipDeniedEvent.TYPE:
        // client.Log.warn(event, "Event deprecated");
        break;
      default:
        return false;
    }
    return true;
  }
}
