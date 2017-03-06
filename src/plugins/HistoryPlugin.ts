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

import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {RoomWindowManager} from "../dwt/windows/RoomWindowManager";
import {EventManager} from "../client/events/EventManager";
import {EventSessionRegistered} from "../client/events/chat/EventSessionRegistered";
import {EventSessionRegisteredHistoryEnabledPlugin} from "./history/EventSessionRegisteredHistoryEnabledPlugin";
import {RoomWindowManagerIsHistoryEnabledPlugin} from "./history/RoomWindowManagerIsHistoryEnabledPlugin";
import {BuddyTreeItemActionMenuFactory} from "../dwt/widgets/BuddyTreeItemActionMenuFactory";
import {MainWindowShowHistoryMenuItemPlugin} from "./history/MainWindowShowHistoryMenuItemPlugin";
import {RoomWindowManagerHistoryPlugin} from "./history/RoomWindowManagerHistoryPlugin";

export class HistoryPlugin {

  public static plugin(
    eventManager: EventManager,
    mainWindowPluginManager: ChatPluginManager,
    roomWindowManagerPluginManager: ChatPluginManager
  ) {
    eventManager.registerEventPlugin(EventSessionRegistered.ID, new EventSessionRegisteredHistoryEnabledPlugin());
    mainWindowPluginManager.registerPlugin(BuddyTreeItemActionMenuFactory.AddMenuItemPlugin, new MainWindowShowHistoryMenuItemPlugin());
    roomWindowManagerPluginManager.registerPlugin(RoomWindowManager.AddRoomWindowPlugin, new RoomWindowManagerIsHistoryEnabledPlugin());
    roomWindowManagerPluginManager.registerPlugin(RoomWindowManager.CreateRoomWindowPluginManager, new RoomWindowManagerHistoryPlugin());
  };

}
