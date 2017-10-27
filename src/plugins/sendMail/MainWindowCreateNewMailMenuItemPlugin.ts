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

import {BuddyTreeItem} from "../../dwt/widgets/BuddyTreeItem";
import {BuddyTreeItemActionMenuFactory} from "../../dwt/widgets/BuddyTreeItemActionMenuFactory";
import {MainWindow} from "../../dwt/windows/MainWindow";
import {IChatPlugin} from "../../lib/plugin/ChatPlugin";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {DwtMenu} from "../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmOperation} from "../../zimbra/zimbraMail/core/ZmOperation";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";

export class MainWindowCreateNewMailMenuItemPlugin implements IChatPlugin {

  public static Name = BuddyTreeItemActionMenuFactory.AddMenuItemPlugin;

  private static sendNewMail(buddyId: string): void {
    const emailData = {
      action: ZmOperation.NEW_MESSAGE,
      toOverride: buddyId,
    };
    AjxDispatcher.run("Compose", emailData);
  }

  public trigger(mainWindow: MainWindow, menu: DwtMenu, treeItem: BuddyTreeItem): void {
    const newMailMenuItem: DwtMenuItem = new DwtMenuItem({
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
    });
    newMailMenuItem.setText(ZmMsg.newEmail);
    newMailMenuItem.addSelectionListener(
      new AjxListener(
        null,
        MainWindowCreateNewMailMenuItemPlugin.sendNewMail,
        [treeItem.getBuddy().getId()],
      ),
    );
    newMailMenuItem.setEnabled(true);
  }

}
