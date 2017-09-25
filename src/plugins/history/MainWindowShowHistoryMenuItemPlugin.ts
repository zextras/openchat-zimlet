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

import {IdGenerator} from "../../dwt/IdGenerator";
import {BuddyTreeItem} from "../../dwt/widgets/BuddyTreeItem";
import {BuddyTreeItemActionMenuFactory} from "../../dwt/widgets/BuddyTreeItemActionMenuFactory";
import {MainWindow} from "../../dwt/windows/MainWindow";
import {ChatPlugin} from "../../lib/plugin/ChatPlugin";
import {StringUtils} from "../../lib/StringUtils";
import {DwtMenu} from "../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmSearchControllerSearchParams} from "../../zimbra/zimbraMail/share/controller/ZmSearchController";

export class MainWindowShowHistoryMenuItemPlugin implements ChatPlugin {

  public static Name = BuddyTreeItemActionMenuFactory.AddMenuItemPlugin;

  private static showHistory(buddyId: string) {
    if (typeof appCtxt.getSearchController() !== "undefined" && appCtxt.getSearchController() !== null) {
      appCtxt.getSearchController().search(
        {
          getHtml: true,
          isEmpty: false,
          origin: "Search",
          query: "in:Chats from:" + buddyId,
          searchFor: "MAIL",
          userInitiated: true,
          userText: true,
        } as ZmSearchControllerSearchParams,
      );
    }
  }

  public trigger(mainWindow: MainWindow, menu: DwtMenu, treeItem: BuddyTreeItem): void {
    const newMailMenuItem: DwtMenuItem = new DwtMenuItem({
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_Search"),
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
    });
    newMailMenuItem.setText(StringUtils.getMessage("friend_history"));
    newMailMenuItem.addSelectionListener(
      new AjxListener(null, MainWindowShowHistoryMenuItemPlugin.showHistory, [treeItem.getBuddy().getId()]),
    );
    newMailMenuItem.setEnabled(true);
  }

}
