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

import {RoomManager} from "../client/RoomManager";
import {BuddyTreeItemActionMenuFactory} from "../dwt/widgets/BuddyTreeItemActionMenuFactory";
import {RoomWindowManager} from "../dwt/windows/RoomWindowManager";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {MainWindowCreateNewMailMenuItemPlugin} from "./sendMail/MainWindowCreateNewMailMenuItemPlugin";
import {RoomManagerHistoryPlugin} from "./sendMail/RoomManagerHistoryPlugin";
import {RoomWindowManagerSendMailPlugin} from "./sendMail/RoomWindowManagerSendMailPlugin";

export class SendMailPlugin {

  public static plugin(
    roomManagerPluginManager: ChatPluginManager,
    mainWindowPluginManager: ChatPluginManager,
    roomWindowManagerPluginManager: ChatPluginManager,
  ): void {
    roomManagerPluginManager.registerPlugin(
      RoomManager.CreateRoomPluginManager,
      new RoomManagerHistoryPlugin(),
    );
    mainWindowPluginManager.registerPlugin(
      BuddyTreeItemActionMenuFactory.AddMenuItemPlugin,
      new MainWindowCreateNewMailMenuItemPlugin(),
    );
    roomWindowManagerPluginManager.registerPlugin(
      RoomWindowManager.CreateRoomWindowPluginManager,
      new RoomWindowManagerSendMailPlugin(),
    );
  }

}
