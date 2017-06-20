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

import {IdGenerator} from "../IdGenerator";
import {ZmActionMenu} from "../../zimbra/zimbraMail/share/view/ZmActionMenu";
import {DwtMenu} from "../../zimbra/ajax/dwt/widgets/DwtMenu";
import {BuddyTreeItem} from "./BuddyTreeItem";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {Version} from "../../lib/Version";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {StringUtils} from "../../lib/StringUtils";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {BuddyStatusType} from "../../client/BuddyStatusType";

export class BuddyTreeItemActionMenuFactory {

  public static AddMenuItemPlugin: string = "BuddyTreeItem Action Menu Add Menu Entry";

  public static createMenu(treeItem: BuddyTreeItem, mainWindowPluginManager: ChatPluginManager): BuddyTreeItemActionMenu7 | BuddyTreeItemActionMenu8 {
    let buddy = treeItem.getBuddy();
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
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Rename")
    });
    menu.optRename.setText(StringUtils.getMessage("friend_rename"));
    menu.optRename.addSelectionListener(new AjxListener(treeItem, treeItem._onRenameBuddy));
    menu.optRename.setEnabled(true);
    if (buddy.getStatus().getType() === BuddyStatusType.INVITED) {
      menu.optSendInvitation = new DwtMenuItem({
        parent: menu,
        style: DwtMenuItem.IMAGE_LEFT,
        id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Send_Invitation")
      });
      menu.optSendInvitation.setText(StringUtils.getMessage("resend_invite"));
      menu.optSendInvitation.setImage("ZxChat_addBuddy");
      menu.optSendInvitation.addSelectionListener(new AjxListener(treeItem, treeItem._onSendInvitation));
      menu.optSendInvitation.setEnabled(buddy.getStatus().getType() === BuddyStatusType.INVITED);
      menu.optSendInvitation.setVisible(buddy.getStatus().getType() === BuddyStatusType.INVITED);
    }
    if (buddy.getStatus().getType() === BuddyStatusType.NEED_RESPONSE) {
      menu.optAcceptInvitation = new DwtMenuItem({
        parent: menu,
        style: DwtMenuItem.IMAGE_LEFT,
        id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Accept_Invitation")
      });
      menu.optAcceptInvitation.setText(StringUtils.getMessage("accept_invitation"));
      menu.optAcceptInvitation.setImage("ZxChat_addBuddy");
      menu.optAcceptInvitation.addSelectionListener(new AjxListener(treeItem, treeItem._onAcceptInvitation));
      menu.optAcceptInvitation.setEnabled(buddy.getStatus().getType() === BuddyStatusType.NEED_RESPONSE);
      menu.optAcceptInvitation.setVisible(buddy.getStatus().getType() === BuddyStatusType.NEED_RESPONSE);
    }
    menu.optDelete = new DwtMenuItem({
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId()) + "_MenuItem_Delete")
    });
    menu.optDelete.setText(StringUtils.getMessage("friend_delete"));
    menu.optDelete.addSelectionListener(new AjxListener(treeItem, treeItem._onDeleteBuddy));
    menu.optDelete.setEnabled(true);
    mainWindowPluginManager.triggerPlugins(BuddyTreeItemActionMenuFactory.AddMenuItemPlugin, menu, treeItem);
    return menu;
  }

}

interface BuddyTreeItemActionMenu {
  buddyTreeItem: BuddyTreeItem;
}

class BuddyTreeItemActionMenu8 extends ZmActionMenu implements BuddyTreeItemActionMenu {
  public buddyTreeItem: BuddyTreeItem;
  constructor(buddyTreeItem: BuddyTreeItem) {
    super({
      parent: buddyTreeItem,
      menuItems: [],
      id: IdGenerator.generateId(`ZxChat_BuddyTreeItem_ActionMenu_${buddyTreeItem.getBuddy().getId()}`)
    });
    this.buddyTreeItem = buddyTreeItem;
  }
}

class BuddyTreeItemActionMenu7 extends DwtMenu implements BuddyTreeItemActionMenu {
  public buddyTreeItem: BuddyTreeItem;
  constructor(buddyTreeItem: BuddyTreeItem) {
    super({
      parent: buddyTreeItem,
      id: IdGenerator.generateId(`ZxChat_BuddyTreeItem_ActionMenu_${buddyTreeItem.getBuddy().getId()}`)
    });
    this.buddyTreeItem = buddyTreeItem;
  }
}