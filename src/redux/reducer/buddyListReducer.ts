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
import {IBuddyListAcceptFriendshipAction} from "../action/buddyList/IBuddyListAcceptFriendshipAction";
import {IBuddyAction} from "../action/IBuddyAction";
import {IBuddyListAction} from "../action/IBuddyListAction";
import {ISetLastUserMessageAction} from "../action/ISetLastUserMessageAction";
import {IUserCapabilitesAction} from "../action/IUserCapabilitesAction";
import {IOpenChatBuddyListMap, IOpenChatBuddyStatusesMap} from "../IOpenChatState";
import {BuddyInitialState, OpenChatBuddyListMapInitialState} from "../OpenChatInitialState";

import {buddyReducer} from "./buddyReducer";

export const buddyListReducer: Reducer<IOpenChatBuddyListMap> = (
  state: IOpenChatBuddyListMap = OpenChatBuddyListMapInitialState,
  action: IBuddyListAction | IUserCapabilitesAction<IOpenChatUserCapabilities> | ISetLastUserMessageAction,
) => {

  switch (action.type) {

    case "POPULATE_BUDDY_LIST": {
      const newState: IOpenChatBuddyListMap = {...state};
      if (typeof action.buddies === "undefined" || action.buddies === null) { return state; }
      for (const buddyJid in action.buddies) {
        if (!action.buddies.hasOwnProperty(buddyJid)) { continue; }
        newState[buddyJid] = action.buddies[buddyJid];
      }
      return newState;
    }

    case "RESET_BUDDY_LIST": {
      return OpenChatBuddyListMapInitialState;
    }

    case "REMOVE_BUDDIES_FROM_BUDDY_LIST": {
      const newState: IOpenChatBuddyListMap = {...state};
      if (typeof action.buddies === "undefined" || action.buddies === null) { return state; }
      for (const buddyJid in action.buddies) {
        if (!action.buddies.hasOwnProperty(buddyJid)) { continue; }
        delete newState[buddyJid];
      }
      return newState;
    }

    case "ACCEPT_FRIENDSHIP": {
      const acceptFriendshipAction: IBuddyListAcceptFriendshipAction = action as IBuddyListAcceptFriendshipAction;
      if (
        typeof acceptFriendshipAction.buddyJid === "undefined" || acceptFriendshipAction.buddyJid === null
        || typeof acceptFriendshipAction.buddyNickname === "undefined" || acceptFriendshipAction.buddyNickname === null
      ) { return state; }
      const newState: IOpenChatBuddyListMap = {...state};
      const statuses: IOpenChatBuddyStatusesMap = {};
      statuses[BuddyStatusUtils.DefaultState.type] = BuddyStatusUtils.DefaultState;
      newState[acceptFriendshipAction.buddyJid] = {
        ...BuddyInitialState,
        jid: acceptFriendshipAction.buddyJid,
        nickname: acceptFriendshipAction.buddyNickname,
        statuses: statuses,
      };
      return newState;
    }

    case "ADD_OR_UPDATE_STATUS_TO_BUDDY":
    case "REMOVE_STATUS_TO_BUDDY":
    case "ADD_GROUP_TO_BUDDY":
    case "REMOVE_GROUP_FROM_BUDDY":
    case "SET_NICKNAME":
    case "SET_USER_CAPABILITIES":
    case "RESET_USER_CAPABILITIES":
    {
      const buddyAction: IBuddyAction = action as IBuddyAction;
      if (!state.hasOwnProperty(buddyAction.buddyJid)) { return state; }
      if (
        typeof buddyAction.buddyJid === "undefined" || buddyAction.buddyJid === null
        || typeof state[buddyAction.buddyJid] === "undefined" || state[buddyAction.buddyJid] === null
      ) { return state; }
      const newState: IOpenChatBuddyListMap = {...state};
      newState[buddyAction.buddyJid] = buddyReducer(state[buddyAction.buddyJid], action);
      return newState;
    }

    case "SET_LAST_USER_MESSAGES":
    {
      if (!state.hasOwnProperty(action.jid)) { return state; }
      if (
        typeof action.jid === "undefined" || action.jid === null
        || typeof state[action.jid] === "undefined" || state[action.jid] === null
      ) { return state; }
      const newState: IOpenChatBuddyListMap = {...state};
      newState[action.jid] = buddyReducer(state[action.jid], action);
      return newState;
    }

    case "ADD_BUDDY_ONLY_SE":
    default:
      return state;

  }
};
