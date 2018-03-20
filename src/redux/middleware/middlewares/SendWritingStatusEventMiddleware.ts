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
import {Callback} from "../../../lib/callbacks/Callback";
import {IDateProvider} from "../../../lib/IDateProvider";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

import {WritingStatusEvent} from "../../../client/events/chat/WritingStatusEvent";
import {IRoomAction} from "../../action/IRoomAction";
import {IOpenChatState} from "../../IOpenChatState";

export class SendWritingStatusEventMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;

  constructor(connectionManager: IConnectionManager, dateProvider: IDateProvider) {
    super();
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "SEND_WRITING_STATUS": {
        const roomAction: IRoomAction = action as Action as IRoomAction;
        this.mConnectionManager.sendEvent(
          new WritingStatusEvent(
            null,
            roomAction.jid,
            this.mDateProvider.getNow(),
            this.mDateProvider.getNow(),
            WritingStatusEvent.fromStringToType(roomAction.writingStatus),
          ),
          Callback.NOOP,
          Callback.NOOP,
        );
        break;
      }
      default: {
        // Do nothing;
      }
    }
    return next(action);
    // Add here the send event after actions
  }

}
