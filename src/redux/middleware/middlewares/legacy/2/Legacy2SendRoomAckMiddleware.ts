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

import {Legacy2RoomAckEvent} from "../../../../../client/events/chat/legacy/2/Legacy2RoomAckEvent";
import {Callback} from "../../../../../lib/callbacks/Callback";
import {ISendRoomAckAction} from "../../../../action/ISendRoomAckAction";
import {IOpenChatMessage, IOpenChatState} from "../../../../IOpenChatState";
import {SendRoomAckMiddleware} from "../../SendRoomAckMiddleware";

export class Legacy2SendRoomAckMiddleware extends SendRoomAckMiddleware {

  private mAcks: {[msgId: string]: boolean} = {};

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "SEND_ROOM_ACK": {
        const act: ISendRoomAckAction = action as Action as ISendRoomAckAction;
        const state: IOpenChatState = store.getState();
        if (state.rooms.hasOwnProperty(act.jid)) {
          const messages: IOpenChatMessage[] = state.rooms[act.jid].messages;
          const msgIds: string[] = [];
          for (const message of messages) {
            if (!this.mAcks.hasOwnProperty(message.id)) {
              msgIds.push(message.id);
              this.mAcks[message.id] = true;
            }
          }

          if (msgIds.length > 0) {
            this.mConnectionManager.sendEvent(
              new Legacy2RoomAckEvent(
                act.jid,
                msgIds,
              ),
              Callback.NOOP,
              Callback.NOOP,
            );
          }
        }
        break;
      }

      case "QUERY_ARCHIVE_FIN_RECEIVED": {
        return super.dispatchAction(next, action, store);
      }
    }
    return next(action);
  }

}
