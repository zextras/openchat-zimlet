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

import {BuddyStatusType} from "../client/BuddyStatusType";
import {IOpenChatUserCapabilities} from "../client/events/chat/IOpenChatUserCapabilities";
import {
  ILastMessageInfo,
  IOpenChatBuddy, IOpenChatBuddyListMap, IOpenChatBuddyStatus,
  IOpenChatMessage, IOpenChatRoom, IOpenChatRoomAcksMap, IOpenChatRoomsMap, IOpenChatSessionInfo,
  IOpenChatState, IOpenChatTextMessage, IOpenChatUserStatus,
} from "./IOpenChatState";

export const BuddyStatusInitialState: IOpenChatBuddyStatus = {
  message: "",
  resource: "default",
  type: BuddyStatusType.OFFLINE,
};

export const UserCapabilitiesInitialState: IOpenChatUserCapabilities = {};

export const BuddyInitialState: IOpenChatBuddy = {
  capabilities: {...UserCapabilitiesInitialState},
  groups: [],
  jid: "unknown_buddy",
  lastMessageReceived: null,
  lastMessageSent: null,
  nickname: "Unknown Buddy",
  statuses: {},
  type: "buddy",
};

export const OpenChatBuddyListMapInitialState: IOpenChatBuddyListMap = {
};

export const OpenChatMessageInitialState: IOpenChatMessage = {
  date: new Date(),
  destination: "",
  id: "",
  roomType: "chat",
  sender: "",
  type: "message",
};

export const OpenChatTextMessageInitialState: IOpenChatTextMessage = {
  ...OpenChatMessageInitialState,
  content: "",
  type: "message",
};

export const OpenChatRoomInitialState: IOpenChatRoom = {
  fullHistoryLoaded: false,
  jid: "empty_room",
  loadingHistory: false,
  messages: [],
  notificationsUnread: 0,
  roomType: "chat",
  writingStatus: "reset",
};

export const OpenChatRoomsMapInitialState: IOpenChatRoomsMap = {
};

export const UserStatusInitialState: IOpenChatUserStatus = {
  message: "",
  resource: "",
  selected: false,
  type: BuddyStatusType.OFFLINE,
};

export const OpenChatCapabilitiesInitialState: IOpenChatUserCapabilities = {};

export const OpenChatSessionInfoInitialState: IOpenChatSessionInfo = {
  avatarSrc: undefined,
  capabilities: OpenChatCapabilitiesInitialState,
  displayname: "",
  responseReceived: 0,
  serverVersion: "0.0.0",
  sessionId: "",
  username: "",
  zimletVersion: "0.0.0",
};

export const OpenChatRoomAcksMapInitialState: IOpenChatRoomAcksMap = {};

export const OpenChatInitialState: IOpenChatState = {
  buddyList: {...OpenChatBuddyListMapInitialState},
  roomAcks: {...OpenChatRoomAcksMapInitialState},
  rooms: {...OpenChatRoomsMapInitialState},
  sessionInfo: {...OpenChatSessionInfoInitialState},
  userStatuses: [],
};

export const LastMessageInfo: ILastMessageInfo = {
  date: new Date(0),
  id: "aaaa",
};
