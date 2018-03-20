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
import {ISessionInfoProvider} from "../../../client/ISessionInfoProvider";
import {ISetSessionInfoAction} from "../../action/ISetSessionInfoAction";
import {IOpenChatState} from "../../IOpenChatState";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

export class SessionInfoMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mSessionInfoProvider: ISessionInfoProvider;
  private mConnectionManager: IConnectionManager;

  constructor(
    sessionInfoProvider: ISessionInfoProvider,
    connectionManager: IConnectionManager,
  ) {
    super();
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mConnectionManager = connectionManager;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "RESET_SESSION_INFO": {
        this.mSessionInfoProvider.resetSessionResponsesReceived();
        this.mSessionInfoProvider.resetSessionId();
        break;
      }

      case "SET_SESSION_INFO": {
        const act: ISetSessionInfoAction = action as Action as ISetSessionInfoAction;
        this.mSessionInfoProvider.setSessionId(act.info.sessionId);
        break;
      }
    }
    return next(action);
  }
}
