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

import {Partial} from "../../lib/Partial";
import {IAddMessageToRoomAction} from "../action/IAddMessageToRoomAction";
import {IModifyMessageAction} from "../action/IModifyMessageAction";
import {IQueryArchiveAction} from "../action/IQueryArchiveAction";
import {IQueryArchiveFinAction} from "../action/IQueryArchiveFinAction";
import {IRoomAction} from "../action/IRoomAction";
import {IRoomNotificationsCounterAction} from "../action/IRoomNotificationsCounterAction";
import {ISetMessageIdAction} from "../action/ISetMessageIdAction";
import {IOpenChatMessage, IOpenChatRoom} from "../IOpenChatState";
import {OpenChatRoomInitialState} from "../OpenChatInitialState";

export const roomReducer: Reducer<IOpenChatRoom> = (
  state: IOpenChatRoom = OpenChatRoomInitialState,
  action: IRoomAction
    | IAddMessageToRoomAction<IOpenChatMessage>
    | ISetMessageIdAction
    | IModifyMessageAction<IOpenChatMessage>
    | IQueryArchiveAction
    | IQueryArchiveFinAction
    | IRoomNotificationsCounterAction
  ,
) => {
  switch (action.type) {

    case "ADD_MESSAGE_TO_ROOM":
    case "SEND_MESSAGE_TO_ROOM": {
      return addMessageToRoom(state, action.message);
    }

    case "MODIFY_MESSAGE": {
      return modifyMessageIntoRoom(state, action.message.id, action.message);
    }

    case "SET_MESSAGE_ID": {
      return modifyMessageIntoRoom(
        state,
        action.oldId,
        {
          date: action.newDate,
          id: action.newId,
        },
      );
    }

    case "SET_WRITING_STATUS": {
      if (typeof action.writingStatus === "undefined" || action.writingStatus === null) {
        return state;
      }
      return {
        ...state,
        jid: action.jid,
        writingStatus: action.writingStatus,
      };
    }

    case "QUERY_ARCHIVE": {
      return {
        ...state,
        loadingHistory: true,
      };
    }

    case "QUERY_ARCHIVE_FIN_RECEIVED": {
      return {
        ...state,
        fullHistoryLoaded: action.count <= 0,
        loadingHistory: false,
      };
    }

    case "SET_ROOM_NOTIFICATION_COUNTER":
    case "RESET_ROOM_NOTIFICATION_COUNTER":
    case "INCREMENT_ROOM_NOTIFICATION_COUNTER": {
      return {
        ...state,
        notificationsUnread: (
          action.type === "RESET_ROOM_NOTIFICATION_COUNTER" ?
            0
            :
            ((action.type === "SET_ROOM_NOTIFICATION_COUNTER") ?
              action.value
              :
              ((typeof action.value !== "undefined") ?
                state.notificationsUnread + action.value
                :
                state.notificationsUnread + 1
                )
            )
        ),
      };
    }

    case "SEND_WRITING_STATUS": {
      return state;
    }

    default:
      return state;

  }
};

export const addMessageToRoom = (
  room: IOpenChatRoom,
  message: IOpenChatMessage,
) => {
  // Array is empty, simply add to the array
  if (room.messages.length === 0) {
    return {
      ...room,
      messages: room.messages.concat(message),
    };
  }

  // Insert into the array, but in the correct position.
  let messageIdx: number = 0;
  for (const roomMessage of room.messages) {
    // But if the message was already received we can avoid to add it again.
    if (roomMessage.id === message.id) { return room; }
    if (message.date.getTime() < roomMessage.date.getTime()) {
      break;
    }
    ++messageIdx;
  }

  return {
    ...room,
    messages: room.messages.slice(0, messageIdx)
      .concat(message)
      .concat(room.messages.slice(messageIdx)),
  };
};

export const modifyMessageIntoRoom = (
  room: IOpenChatRoom,
  messageId: string,
  mods: Partial<IOpenChatMessage>,
) => {
  if (room.messages.length === 0) {
    return room;
  }
  let idx: number = -1;
  for (let i = room.messages.length - 1; i >= 0; i--) {
    if (room.messages[i].id === messageId) {
      idx = i;
      break;
    }
  }
  if (idx > -1) {
    const messages: IOpenChatMessage[] = [].concat(room.messages);
    const message: IOpenChatMessage = {
      ...messages.splice(idx, 1)[0],
      ...mods,
    };

    return addMessageToRoom(
      {
        ...room,
        messages: messages,
      },
      message,
    );
  } else {
    return room;
  }
};
