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

import {IResetSessionInfoAction} from "../action/IResetSessionInfoAction";
import {ISetSessionInfoAction} from "../action/ISetSessionInfoAction";
import {IOpenChatSessionInfo} from "../IOpenChatState";
import {OpenChatSessionInfoInitialState} from "../OpenChatInitialState";

export const sessionInfoReducer: Reducer<IOpenChatSessionInfo> = (
  state: IOpenChatSessionInfo = OpenChatSessionInfoInitialState,
  action: IResetSessionInfoAction | ISetSessionInfoAction,
) => {
  switch (action.type) {

    case "RESET_SESSION_INFO": {
      // Reset all the session info except the displayname and username.
      return {
        ...OpenChatSessionInfoInitialState,
        displayname: state.displayname,
        username: state.username,
      };
    }

    case "SET_SESSION_INFO": {
      return {
        ...action.info,
        capabilities: {...action.info.capabilities},
      };
    }

    default:
      return state;

  }
};
