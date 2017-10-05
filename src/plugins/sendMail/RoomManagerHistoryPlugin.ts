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

import {Room} from "../../client/Room";
import {RoomManager} from "../../client/RoomManager";
import {IChatPlugin} from "../../lib/plugin/ChatPlugin";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {RoomHistoryFieldPlugin} from "./RoomHistoryFieldPlugin";
import {RoomStoreMessageInHistoryPlugin} from "./RoomStoreMessageInHistoryPlugin";

export class RoomManagerHistoryPlugin implements IChatPlugin {

  public trigger(roomManager: RoomManager, roomPluginManager: ChatPluginManager): void {
    roomPluginManager.registerFieldPlugin(RoomHistoryFieldPlugin.FieldName, new RoomHistoryFieldPlugin());
    const messageStore: RoomStoreMessageInHistoryPlugin = new RoomStoreMessageInHistoryPlugin();
    roomPluginManager.registerPlugin(Room.MessageSentPlugin, messageStore);
    roomPluginManager.registerPlugin(Room.MessageSentFromAnotherSessionPlugin, messageStore);
    roomPluginManager.registerPlugin(Room.MessageReceivedPlugin, messageStore);
  }

}
