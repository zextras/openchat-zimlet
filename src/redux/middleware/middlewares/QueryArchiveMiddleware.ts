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
import {QueryArchiveEvent} from "../../../client/events/chat/QueryArchiveEvent";
import {Callback} from "../../../lib/callbacks/Callback";
import {IDateProvider} from "../../../lib/IDateProvider";
import {IQueryArchiveAction} from "../../action/IQueryArchiveAction";
import {IOpenChatState} from "../../IOpenChatState";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

export class QueryArchiveMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;

  constructor(connectionManager: IConnectionManager, dateProvider: IDateProvider) {
    super();
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "QUERY_ARCHIVE": {
        const act: IQueryArchiveAction = action as Action as IQueryArchiveAction;
        if (!store.getState().rooms[act.with].loadingHistory) {
          this.mConnectionManager.sendEvent(
            new QueryArchiveEvent(
              act.with,
              act.max,
              act.before,
              act.after,
              act.start,
              act.end,
            ),
            Callback.NOOP,
            Callback.NOOP,
          );
        }
      }
    }
    return next(action);
  }
}
