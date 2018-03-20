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
import {RenameFriendshipEvent} from "../../../client/events/chat/RenameFriendshipEvent";
import {Callback} from "../../../lib/callbacks/Callback";
import {IDateProvider} from "../../../lib/IDateProvider";
import {IBuddyAction} from "../../action/IBuddyAction";
import {IOpenChatState} from "../../IOpenChatState";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

export class RenameBuddyEventMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;

  constructor(connectionManager: IConnectionManager, dateProvider: IDateProvider) {
    super();
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "SET_NICKNAME_SE": {
        const buddyAction: IBuddyAction = action as Action as IBuddyAction;
        if (
          typeof buddyAction.buddyJid === "undefined" || buddyAction.buddyJid === null ||
          typeof buddyAction.nickname === "undefined" || buddyAction.nickname === null ||
          typeof buddyAction.group === "undefined" || buddyAction.group === null
        ) { return; }
        this.mConnectionManager.sendEvent(
          new RenameFriendshipEvent(
            buddyAction.buddyJid,
            buddyAction.nickname,
            buddyAction.group,
            this.mDateProvider.getNow()),
          Callback.NOOP,
          Callback.NOOP,
        );
        break;
      }
      default: {}
    }
    return next(action);
  }

}
