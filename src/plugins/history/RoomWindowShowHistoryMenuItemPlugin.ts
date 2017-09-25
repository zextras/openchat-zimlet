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

import {RoomWindow} from "../../dwt/windows/RoomWindow";
import {RoomWindowMenuButton} from "../../dwt/windows/RoomWindowMenuButton";
import {ChatPlugin} from "../../lib/plugin/ChatPlugin";
import {StringUtils} from "../../lib/StringUtils";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmSearchControllerSearchParams} from "../../zimbra/zimbraMail/share/controller/ZmSearchController";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";
import {RoomWindowHistoryEnablePlugin} from "./RoomWindowHistoryEnablePlugin";

export class RoomWindowShowHistoryMenuItemPlugin implements ChatPlugin {

  public static Name = RoomWindowMenuButton.AddMenuItemPlugin;

  private static showHistory(roomWindow: RoomWindow): void {
    const ids: string[] = [];
    for (const buddy of roomWindow.getRoom().getMembers()) {
      ids.push("from:(" + (buddy.getId()) + ")");
    }
    appCtxt.getSearchController().search(
      {
        getHtml: true,
        isEmpty: false,
        origin: "Search",
        query: "in:chats " + (ids.join(" or ")),
        searchFor: "MAIL",
        userInitiated: true,
        userText: true,
      } as ZmSearchControllerSearchParams,
    );
  }

  public trigger(roomWindow: RoomWindow, menu: ZmPopupMenu): void {
    const historyMenuItem: DwtMenuItem = menu.createMenuItem(
      "ZxChat_MenuItem_History",
      {
        text: StringUtils.getMessage("friend_history"),
      },
    );
    historyMenuItem.addSelectionListener(
      new AjxListener(null, RoomWindowShowHistoryMenuItemPlugin.showHistory, [roomWindow]),
    );
    roomWindow.getPluginManager().registerPlugin(
      RoomWindowHistoryEnablePlugin.Name,
      new RoomWindowHistoryEnablePlugin(historyMenuItem),
    );
  }

}
