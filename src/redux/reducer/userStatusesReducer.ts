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
import {IUserStatusAction} from "../action/IUserStatusAction";
import {IOpenChatUserStatus} from "../IOpenChatState";

export const userStatusesReducer: Reducer<IOpenChatUserStatus[]> = (
  state: IOpenChatUserStatus[] = [],
  action: IUserStatusAction,
) => {
  switch (action.type) {

    case "ADD_USER_STATUS": {
      return state.concat(action.status);
    }

    case "UPDATE_USER_STATUS": {
      for (const statusIndex in state) {
        if (state[statusIndex].type === action.status.type) {
          return state
            .slice(0, parseInt(statusIndex, 10))
            .concat(action.status)
            .concat(state.slice(parseInt(statusIndex, 10) + 1, 10));
        }
      }
      return state;
    }

    case "REMOVE_USER_STATUS": {
      for (const statusIndex in state) {
        if (state[statusIndex].type === action.statusType) {
          return state
            .slice(0, parseInt(statusIndex, 10))
            .concat(state.slice(parseInt(statusIndex, 10) + 1, 10));
        }
      }
      return state;
    }

    case "SET_USER_STATUS":
    case "SET_USER_STATUS_SE": {
      const newState: IOpenChatUserStatus[] = [];
      for (const status of state) {
        if (status === action.status || status.type === action.statusType) {
          newState.push({
            ...status,
            selected: true,
          });
        } else {
          if (status.selected) {
            newState.push({
              ...status,
              selected: false,
            });
          } else {
            newState.push(status);
          }
        }
      }
      return newState;
    }

    default:
      return state;
  }
};
