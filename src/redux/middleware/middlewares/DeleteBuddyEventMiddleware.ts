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

import {Action, Dispatch, MiddlewareAPI} from "redux";

import {IConnectionManager} from "../../../client/connection/IConnectionManager";
import {RemoveFriendshipEvent} from "../../../client/events/chat/RemoveFriendshipEvent";
import {Callback} from "../../../lib/callbacks/Callback";
import {IDateProvider} from "../../../lib/IDateProvider";
import {IBuddyListAction} from "../../action/IBuddyListAction";
import {IOpenChatState} from "../../IOpenChatState";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

export class DeleteBuddyEventMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;

  constructor(connectionManager: IConnectionManager, dateProvider: IDateProvider) {
    super();
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "REMOVE_BUDDIES_FROM_BUDDY_LIST_SE": {
        const buddyListAction: IBuddyListAction & {callback: Callback} =
          action as Action as IBuddyListAction & {callback: Callback};
        if (typeof buddyListAction.buddies === "undefined" || buddyListAction.buddies === null) { return; }
        for (const buddyJid in buddyListAction.buddies) {
          if (!buddyListAction.buddies.hasOwnProperty(buddyJid)) {continue; }
          this.mConnectionManager.sendEvent(
            new RemoveFriendshipEvent(
              buddyJid,
              "",
              this.mDateProvider.getNow()),
            buddyListAction.callback || Callback.NOOP,
            Callback.NOOP,
          );
        }
        break;
      }
      default: {}
    }
    return next(action);
  }

}
