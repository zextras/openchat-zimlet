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

import {IAddMessageToRoomAction} from "../action/IAddMessageToRoomAction";
import {IModifyMessageAction} from "../action/IModifyMessageAction";
import {IQueryArchiveAction} from "../action/IQueryArchiveAction";
import {IQueryArchiveFinAction} from "../action/IQueryArchiveFinAction";
import {IRoomAction} from "../action/IRoomAction";
import {IRoomNotificationsCounterAction} from "../action/IRoomNotificationsCounterAction";
import {IRoomsAction} from "../action/IRoomsAction";
import {ISetMessageIdAction} from "../action/ISetMessageIdAction";
import {IOpenChatMessage, IOpenChatRoom, IOpenChatRoomsMap} from "../IOpenChatState";
import {
  OpenChatRoomInitialState,
  OpenChatRoomsMapInitialState,
} from "../OpenChatInitialState";
import {roomReducer} from "./roomReducer";

export const roomsReducer: Reducer<IOpenChatRoomsMap> = (
  state: IOpenChatRoomsMap = OpenChatRoomsMapInitialState,
  action: IRoomsAction
    | IAddMessageToRoomAction<IOpenChatMessage>
    | ISetMessageIdAction
    | IModifyMessageAction<IOpenChatMessage>
    | IQueryArchiveAction
    | IQueryArchiveFinAction
    | IRoomNotificationsCounterAction
  ,
) => {
  switch (action.type) {

    case "ADD_ROOM": {
      const newState: IOpenChatRoomsMap = {...state};
      if (typeof state[action.jid] !== "undefined" && state[action.jid] !== null) {
        return state;
      }
      let roomType: "chat" | string = OpenChatRoomInitialState.roomType;
      if (typeof action.roomType !== "undefined" && action.roomType !== null) {
        roomType = action.roomType;
      }
      newState[action.jid] = {
        ...OpenChatRoomInitialState,
        jid: action.jid,
        roomType: roomType,
      };
      return newState;
    }

    case "REMOVE_ROOM": {
      const newState: IOpenChatRoomsMap = {...state};
      delete newState[action.jid];
      return newState;
    }

    case "MODIFY_MESSAGE":
    case "SET_WRITING_STATUS":
    case "SEND_WRITING_STATUS":
    {
      // TODO: Add more checks to detect modifications, the roomReducer may return an unmodified state.
      const newState: IOpenChatRoomsMap = {...state};
      newState[action.jid] = roomReducer(
        state[action.jid],
        action as IRoomAction,
      );
      return newState;
    }

    case "SET_MESSAGE_ID": {
      const roomState: IOpenChatRoom = roomReducer(state[action.roomJid], action);
      if (roomState !== state[action.roomJid]) {
        const newState = { ...state };
        newState[roomState.jid] = roomState;
        return newState;
      }
      return state;
    }

    case "ADD_MESSAGE_TO_ROOM":
    case "SEND_MESSAGE_TO_ROOM": {
      const roomState: IOpenChatRoom = roomReducer(state[action.jid], action);
      if (roomState !== state[action.jid]) {
        const newState = { ...state };
        newState[roomState.jid] = roomState;
        return newState;
      }
      return state;
    }

    case "QUERY_ARCHIVE": {
      const roomState: IOpenChatRoom = roomReducer(state[action.with], action);
      if (roomState !== state[action.with]) {
        const newState = { ...state };
        newState[roomState.jid] = roomState;
        return newState;
      }
      return state;
    }

    case "QUERY_ARCHIVE_FIN_RECEIVED": {
      const roomState: IOpenChatRoom = roomReducer(state[action.roomJid], action);
      if (roomState !== state[action.roomJid]) {
        const newState = { ...state };
        newState[roomState.jid] = roomState;
        return newState;
      }
      return state;
    }

    case "SET_ROOM_NOTIFICATION_COUNTER":
    case "RESET_ROOM_NOTIFICATION_COUNTER":
    case "INCREMENT_ROOM_NOTIFICATION_COUNTER": {
      if (typeof state[action.roomJid] === "undefined") { return state; }
      const roomState: IOpenChatRoom = roomReducer(state[action.roomJid], action);
      if (roomState !== state[action.roomJid]) {
        const newState = { ...state };
        newState[roomState.jid] = roomState;
        return newState;
      }
      return state;
    }

    default:
      return state;

  }
};
