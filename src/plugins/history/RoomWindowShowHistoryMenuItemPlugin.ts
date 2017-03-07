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

import {RoomWindowHistoryEnablePlugin} from "./RoomWindowHistoryEnablePlugin";
import {ChatPlugin} from "../../lib/plugin/ChatPlugin";
import {RoomWindowMenuButton} from "../../dwt/windows/RoomWindowMenuButton";
import {RoomWindow} from "../../dwt/windows/RoomWindow";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {StringUtils} from "../../lib/StringUtils";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmSearchControllerSearchParams} from "../../zimbra/zimbraMail/share/controller/ZmSearchController";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";

export class RoomWindowShowHistoryMenuItemPlugin implements ChatPlugin {

  public static Name = RoomWindowMenuButton.AddMenuItemPlugin;

  public trigger(roomWindow: RoomWindow, menu: ZmPopupMenu): void {
    let historyMenuItem: DwtMenuItem = menu.createMenuItem(
      "ZxChat_MenuItem_History",
      {
        text: StringUtils.getMessage("friend_history")
      }
    );
    historyMenuItem.addSelectionListener(
      new AjxListener(null, RoomWindowShowHistoryMenuItemPlugin.showHistory, [roomWindow])
    );
    roomWindow.getPluginManager().registerPlugin(RoomWindowHistoryEnablePlugin.Name, new RoomWindowHistoryEnablePlugin(historyMenuItem));
  }

  private static showHistory(roomWindow: RoomWindow): void {
    let ids: string[] = [];
    for (let buddy of roomWindow.room.getMembers()) {
      ids.push("from:(" + (buddy.getId()) + ")");
    }
    appCtxt.getSearchController().search(
      <ZmSearchControllerSearchParams> {
        query: "in:chats " + (ids.join(" or ")),
        searchFor: "MAIL",
        userText: true,
        userInitiated: true,
        getHtml: true,
        origin: "Search",
        isEmpty: false
      }
    );
  }
}
