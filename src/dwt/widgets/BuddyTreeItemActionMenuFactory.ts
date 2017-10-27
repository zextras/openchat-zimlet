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

import {BuddyStatusType} from "../../client/BuddyStatusType";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {StringUtils} from "../../lib/StringUtils";
import {Version} from "../../lib/Version";
import {DwtMenu} from "../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmActionMenu} from "../../zimbra/zimbraMail/share/view/ZmActionMenu";
import {IdGenerator} from "../IdGenerator";
import {BuddyTreeItem} from "./BuddyTreeItem";

export class BuddyTreeItemActionMenuFactory {

  public static AddMenuItemPlugin: string = "BuddyTreeItem Action Menu Add Menu Entry";

  public static createMenu(
    treeItem: BuddyTreeItem,
    mainWindowPluginManager: ChatPluginManager,
  ): BuddyTreeItemActionMenu7 | BuddyTreeItemActionMenu8 {
    const buddy = treeItem.getBuddy();
    let menu: BuddyTreeItemActionMenu7 | BuddyTreeItemActionMenu8;
    if (Version.isZ8Up()) {
      menu = new BuddyTreeItemActionMenu8(treeItem);
    } else {
      menu = new BuddyTreeItemActionMenu7(treeItem);
    }
    if (menu === null) {
      return;
    }
    menu.optRename = new DwtMenuItem({
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Rename"),
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
    });
    menu.optRename.setText(StringUtils.getMessage("friend_rename"));
    menu.optRename.addSelectionListener(new AjxListener(treeItem, treeItem._onRenameBuddy));
    menu.optRename.setEnabled(true);
    if (buddy.getStatus().getType() === BuddyStatusType.INVITED) {
      menu.optSendInvitation = new DwtMenuItem({
        id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Send_Invitation"),
        parent: menu,
        style: DwtMenuItem.IMAGE_LEFT,
      });
      menu.optSendInvitation.setText(StringUtils.getMessage("resend_invite"));
      menu.optSendInvitation.setImage("ZxChat_addBuddy");
      menu.optSendInvitation.addSelectionListener(new AjxListener(treeItem, treeItem._onSendInvitation));
      menu.optSendInvitation.setEnabled(buddy.getStatus().getType() === BuddyStatusType.INVITED);
      menu.optSendInvitation.setVisible(buddy.getStatus().getType() === BuddyStatusType.INVITED);
    }
    if (buddy.getStatus().getType() === BuddyStatusType.NEED_RESPONSE) {
      menu.optAcceptInvitation = new DwtMenuItem({
        id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Accept_Invitation"),
        parent: menu,
        style: DwtMenuItem.IMAGE_LEFT,
      });
      menu.optAcceptInvitation.setText(StringUtils.getMessage("accept_invitation"));
      menu.optAcceptInvitation.setImage("ZxChat_addBuddy");
      menu.optAcceptInvitation.addSelectionListener(new AjxListener(treeItem, treeItem._onAcceptInvitation));
      menu.optAcceptInvitation.setEnabled(buddy.getStatus().getType() === BuddyStatusType.NEED_RESPONSE);
      menu.optAcceptInvitation.setVisible(buddy.getStatus().getType() === BuddyStatusType.NEED_RESPONSE);
    }
    menu.optDelete = new DwtMenuItem({
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Delete"),
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
    });
    menu.optDelete.setText(StringUtils.getMessage("friend_delete"));
    menu.optDelete.addSelectionListener(new AjxListener(treeItem, treeItem._onDeleteBuddy));
    menu.optDelete.setEnabled(true);
    mainWindowPluginManager.triggerPlugins(BuddyTreeItemActionMenuFactory.AddMenuItemPlugin, menu, treeItem);
    return menu;
  }

}

interface IBuddyTreeItemActionMenu {
  buddyTreeItem: BuddyTreeItem;
}

// tslint:disable-next-line:max-classes-per-file
class BuddyTreeItemActionMenu8 extends ZmActionMenu implements IBuddyTreeItemActionMenu {
  public buddyTreeItem: BuddyTreeItem;
  constructor(buddyTreeItem: BuddyTreeItem) {
    super({
      id: IdGenerator.generateId(`ZxChat_BuddyTreeItem_ActionMenu_${buddyTreeItem.getBuddy().getId()}`),
      menuItems: [],
      parent: buddyTreeItem,
    });
    this.buddyTreeItem = buddyTreeItem;
  }
}

// tslint:disable-next-line:max-classes-per-file
class BuddyTreeItemActionMenu7 extends DwtMenu implements IBuddyTreeItemActionMenu {
  public buddyTreeItem: BuddyTreeItem;
  constructor(buddyTreeItem: BuddyTreeItem) {
    super({
      id: IdGenerator.generateId(`ZxChat_BuddyTreeItem_ActionMenu_${buddyTreeItem.getBuddy().getId()}`),
      parent: buddyTreeItem,
    });
    this.buddyTreeItem = buddyTreeItem;
  }
}
