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
import {RoomAckEvent} from "../../../client/events/chat/RoomAckEvent";
import {Callback} from "../../../lib/callbacks/Callback";
import {ISendRoomAckAction} from "../../action/ISendRoomAckAction";
import {IOpenChatState} from "../../IOpenChatState";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

export class SendRoomAckMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  protected mConnectionManager: IConnectionManager;
  private mLastAcks: {[jid: string]: string} = {};

  constructor(connectionManager: IConnectionManager) {
    super();
    this.mConnectionManager = connectionManager;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "SEND_ROOM_ACK": {
        const act: ISendRoomAckAction = action as Action as ISendRoomAckAction;
        if (
          !this.mLastAcks.hasOwnProperty(act.jid)
          || this.mLastAcks[act.jid] !== act.message_id
        ) {
          this.mConnectionManager.sendEvent(
            new RoomAckEvent(
              act.jid,
              act.message_time,
              act.message_id,
            ),
            Callback.NOOP,
            Callback.NOOP,
          );
          this.mLastAcks[act.jid] = act.message_id;
        }
        break;
      }
    }
    return next(action);
  }

}
