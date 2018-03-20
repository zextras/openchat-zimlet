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

import {AcceptFriendshipEvent} from "../../../client/events/chat/AcceptFriendshipEvent";

import {Action, Dispatch, MiddlewareAPI} from "redux";

import {IConnectionManager} from "../../../client/connection/IConnectionManager";
import {FriendshipInvitationEvent} from "../../../client/events/chat/friendship/FriendshipInvitationEvent";
import {Callback} from "../../../lib/callbacks/Callback";
import {IDateProvider} from "../../../lib/IDateProvider";
import {IBuddyListAcceptFriendshipAction} from "../../action/buddyList/IBuddyListAcceptFriendshipAction";
import {IBuddyListAction} from "../../action/IBuddyListAction";
import {IRoomsAction} from "../../action/IRoomsAction";
import {IOpenChatBuddy, IOpenChatState} from "../../IOpenChatState";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

export class AddBuddyEventMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;

  constructor(connectionManager: IConnectionManager, dateProvider: IDateProvider) {
    super();
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "ADD_BUDDY_ONLY_SE": {
        const buddyListAction: IBuddyListAction = action as Action as IBuddyListAction;
        if (
          typeof buddyListAction.buddies === "undefined" || buddyListAction.buddies === null
        ) { return next(action); }
        for (const buddyJid in buddyListAction.buddies) {
          if (!buddyListAction.buddies.hasOwnProperty(buddyJid)) {continue; }
          const buddy: IOpenChatBuddy = buddyListAction.buddies[buddyJid];
          this.mConnectionManager.sendEvent(
            new FriendshipInvitationEvent(
              buddy.jid,
              buddy.nickname,
              "",
              this.mDateProvider.getNow(),
            ),
            Callback.NOOP,
          );
        }
        break;
      }
      case "ACCEPT_FRIENDSHIP": {
        const acceptFriendshipAction: IBuddyListAcceptFriendshipAction =
          action as Action as IBuddyListAcceptFriendshipAction;
        if (
          typeof acceptFriendshipAction.buddyJid === "undefined" || acceptFriendshipAction.buddyJid === null ||
          typeof acceptFriendshipAction.buddyNickname === "undefined" || acceptFriendshipAction.buddyNickname === null
        ) { return next(action); }
        this.mConnectionManager.sendEvent(
          new AcceptFriendshipEvent(
            acceptFriendshipAction.buddyJid,
            acceptFriendshipAction.buddyNickname,
            this.mDateProvider.getNow(),
          ),
          Callback.NOOP,
        );
        break;
      }
      case "POPULATE_BUDDY_LIST": {
        const buddyListAction: IBuddyListAction = action as Action as IBuddyListAction;
        const state: IOpenChatState = store.getState() as {} as IOpenChatState;
        for (const jid in buddyListAction.buddies) {
          if (!buddyListAction.buddies.hasOwnProperty(jid)) { continue; }
          if (state.buddyList.hasOwnProperty(jid)) { continue; }
          store.dispatch<IRoomsAction>({
            jid: jid,
            roomType: "chat",
            type: "ADD_ROOM",
          });
        }
        break;
      }
      default: {}
    }
    return next(action);
  }

}
