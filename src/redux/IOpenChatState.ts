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
import {Version} from "../lib/Version";

export interface IOpenChatBuddyStatus {
  message: string;
  resource: string;
  type: BuddyStatusType;
}

export interface IOpenChatBuddyStatusesMap {
  [resource: string]: IOpenChatBuddyStatus;
}

export interface IOpenChatBuddy {
  groups: string[];
  capabilities: IOpenChatUserCapabilities;
  jid: string;
  nickname: string;
  statuses: IOpenChatBuddyStatusesMap;
  type: "buddy";
}

export interface IOpenChatBuddyListMap {
  [jid: string]: IOpenChatBuddy;
}

export interface IOpenChatMessage {
  date: Date;
  destination: string;
  id: string;
  sender: string;
  type: "message" | string;
  roomType: "chat" | string;
}

export interface IOpenChatTextMessage extends IOpenChatMessage {
  content: string;
  type: "message";
}

export interface IOpenChatRoom {
  jid: string;
  messages: IOpenChatMessage[];
  notificationsUnread: number;
  loadingHistory: boolean;
  fullHistoryLoaded: boolean;
  roomType: "chat" | string;
  writingStatus: "reset" | "isWriting" | "hasWritten";
}

export interface IOpenChatRoomsMap {
  [jid: string]: IOpenChatRoom;
}

export interface IOpenChatUserStatus extends IOpenChatBuddyStatus {
  selected: boolean;
}

export interface IOpenChatSessionInfo {
  avatarSrc: string;
  capabilities: IOpenChatUserCapabilities;
  displayname: string;
  responseReceived: number;
  serverVersion: string;
  sessionId: string;
  username: string;
  zimletVersion: string;
}

export interface IOpenChatRoomAck {
  lastMessageDate: Date;
  lastMessageId: string;
}

export interface IOpenChatRoomBuddyAcksMap {
  [buddyJid: string]: IOpenChatRoomAck;
}

export interface IOpenChatRoomAcksMap {
  [roomJid: string]: IOpenChatRoomBuddyAcksMap;
}

export interface IOpenChatState {
  buddyList: IOpenChatBuddyListMap;
  roomAcks: IOpenChatRoomAcksMap;
  rooms: IOpenChatRoomsMap;
  sessionInfo: IOpenChatSessionInfo;
  userStatuses: IOpenChatUserStatus[];
}
