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

import {IOpenChatUserCapabilities} from "../../client/events/chat/IOpenChatUserCapabilities";
import {IUserCapabilitesAction} from "../action/IUserCapabilitesAction";
import {UserCapabilitiesInitialState} from "../OpenChatInitialState";

export const userCapabilitiesReducer: Reducer<IOpenChatUserCapabilities> = (
  state: IOpenChatUserCapabilities = UserCapabilitiesInitialState,
  action: IUserCapabilitesAction<IOpenChatUserCapabilities>,
) => {
  switch (action.type) {

    case "SET_USER_CAPABILITIES": {
      return {
        ...state,
        ...action.capabilities,
      };
    }

    case "RESET_USER_CAPABILITIES": {
      return {};
    }

    default: return state;
  }
};
