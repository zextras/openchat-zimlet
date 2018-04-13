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

import {BuddyStatusUtils} from "../../app/conversation/BuddyStatusUtils";
import {IOpenChatUserCapabilities} from "../../client/events/chat/IOpenChatUserCapabilities";
import {IBuddyAction} from "../action/IBuddyAction";
import {IResetSessionInfoAction} from "../action/IResetSessionInfoAction";
import {ISetLastUserMessageAction} from "../action/ISetLastUserMessageAction";
import {IUserCapabilitesAction} from "../action/IUserCapabilitesAction";
import {IOpenChatBuddy} from "../IOpenChatState";
import {BuddyInitialState} from "../OpenChatInitialState";

import {userCapabilitiesReducer} from "./userCapabilitiesReducer";

export const buddyReducer: Reducer<IOpenChatBuddy> = (
  state: IOpenChatBuddy = {...BuddyInitialState},
  action: IBuddyAction
    | IUserCapabilitesAction<IOpenChatUserCapabilities>
    | ISetLastUserMessageAction
    | IResetSessionInfoAction,
) => {
  switch (action.type) {

    case "ADD_OR_UPDATE_STATUS_TO_BUDDY": {
      if (typeof action.status === "undefined" || action.status === null) { return state; }
      const newState: IOpenChatBuddy = {
        ...state,
        statuses: {
          ...state.statuses,
        },
      };
      delete newState.statuses[BuddyStatusUtils.DefaultState.resource];
      newState.statuses[action.status!.resource] = action.status!;
      return newState;
    }

    case "REMOVE_STATUS_TO_BUDDY": {
      if (typeof action.statusResource === "undefined" || action.statusResource === null) { return state; }
      const newState: IOpenChatBuddy = {
        ...state,
        statuses: {...state.statuses},
      };
      delete newState.statuses[action.statusResource];
      return newState;
    }

    case "ADD_GROUP_TO_BUDDY": {
      if (typeof action.group === "undefined" || action.group === null) { return state; }
      for (const groupIndex in state.groups) {
        if (state.groups[groupIndex] === action.group) {
          return state;
        }
      }
      return {
        ...state,
        groups: state.groups.concat(action.group),
      };
    }

    case "REMOVE_GROUP_FROM_BUDDY": {
      if (typeof action.group === "undefined" || action.group === null) { return state; }
      for (const groupIndex in state.groups) {
        if (state.groups[groupIndex] === action.group) {
          return {
            ...state,
            groups: state.groups
              .slice(0, parseInt(groupIndex, 10))
              .concat(state.groups.slice(parseInt(groupIndex, 10) + 1)),
          };
        }
      }
      return state;
    }

    case "SET_NICKNAME":
    case "SET_NICKNAME_SE": {
      if (typeof action.nickname === "undefined" || action.nickname === null) { return state; }
      return {
        ...state,
        nickname: action.nickname,
      };
    }

    case "SET_USER_CAPABILITIES":
    case "RESET_USER_CAPABILITIES": {
      return {
        ...state,
        capabilities: userCapabilitiesReducer(state.capabilities, action),
      };
    }

    case "SET_LAST_USER_MESSAGES": {
      const newState = { ...state };
      if (typeof action.received !== "undefined") {
        newState.lastMessageReceived = action.received;
      }
      if (typeof action.sent !== "undefined") {
        newState.lastMessageSent = action.sent;
      }
      return newState;
    }

    default: return state;
  }
};
