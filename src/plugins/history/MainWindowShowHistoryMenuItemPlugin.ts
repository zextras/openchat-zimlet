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

import {ChatPlugin} from "../../lib/plugin/ChatPlugin";
import {MainWindow} from "../../dwt/windows/MainWindow";
import {DwtMenu} from "../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {IdGenerator} from "../../dwt/IdGenerator";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {BuddyTreeItem} from "../../dwt/widgets/BuddyTreeItem";
import {ZmSearchControllerSearchParams} from "../../zimbra/zimbraMail/share/controller/ZmSearchController";
import {BuddyTreeItemActionMenuFactory} from "../../dwt/widgets/BuddyTreeItemActionMenuFactory";
import {StringUtils} from "../../lib/StringUtils";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";

export class MainWindowShowHistoryMenuItemPlugin implements ChatPlugin {

  public static Name = BuddyTreeItemActionMenuFactory.AddMenuItemPlugin;

  trigger(mainWindow: MainWindow, menu: DwtMenu, treeItem: BuddyTreeItem): void {
    let newMailMenuItem: DwtMenuItem = new DwtMenuItem({
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_Search")
    });
    newMailMenuItem.setText(StringUtils.getMessage("friend_history"));
    newMailMenuItem.setImage("ZxChat_history");
    newMailMenuItem.addSelectionListener(new AjxListener(null, MainWindowShowHistoryMenuItemPlugin.showHistory, [treeItem.getBuddy().getId()]));
    newMailMenuItem.setEnabled(true);
  }

  private static showHistory(buddyId: string) {
    if (typeof appCtxt.getSearchController() !== "undefined" && appCtxt.getSearchController() !== null) {
      appCtxt.getSearchController().search(
        <ZmSearchControllerSearchParams> {
          query: "in:Chats from:" + buddyId,
          userText: true,
          userInitiated: true,
          getHtml: true,
          searchFor: "MAIL",
          origin: "Search",
          isEmpty: false
        }
      );
    }
  }
}
