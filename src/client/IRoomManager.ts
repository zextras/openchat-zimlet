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

import {Callback} from "../lib/callbacks/Callback";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {IBuddy} from "./IBuddy";
import {IBuddyStatus} from "./IBuddyStatus";
import {IRoom} from "./IRoom";

export interface IRoomManager {
  getPluginManager(): ChatPluginManager;
  createRoom(buddyId: string, buddyNickname: string, roomPluginManager: ChatPluginManager): IRoom;
  getRoomById(roomId: string): IRoom;
  getRooms(): IRoom[];
  statusSelected(status: IBuddyStatus, callback: Callback): void;
  removeRoom(roomId: string): void;
  onRoomAdded(callback: Callback): void;
  onSendEvent(callback: Callback): void;
  onSendMessage(callback: Callback): void;
  removeBuddyFromAllRooms(buddy: IBuddy): void;
  addBuddyToHisRooms(buddy: IBuddy): void;
}
