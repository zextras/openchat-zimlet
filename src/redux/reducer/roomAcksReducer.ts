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

import {Reducer} from "redux";

import {ISetRoomAckAction} from "../action/ISetRoomAckAction";
import {IOpenChatRoomAcksMap} from "../IOpenChatState";
import {OpenChatRoomAcksMapInitialState} from "../OpenChatInitialState";

export const roomAcksReducer: Reducer<IOpenChatRoomAcksMap> = (
  state: IOpenChatRoomAcksMap = OpenChatRoomAcksMapInitialState,
  action: ISetRoomAckAction,
) => {
  switch (action.type) {

    case "SET_ROOM_ACK": {
      const newState: IOpenChatRoomAcksMap = {...state};
      const jid: string = action.jid.split("/")[0];
      newState[jid] = {};
      newState[jid][jid] = {
        lastMessageDate: action.message_time,
        lastMessageId: action.message_id,
      };
      return newState;
    }

    default:
      return state;
  }
};
