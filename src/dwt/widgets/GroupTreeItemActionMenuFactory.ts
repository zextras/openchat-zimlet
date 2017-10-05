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

import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {Version} from "../../lib/Version";
import {DwtMenu} from "../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmActionMenu} from "../../zimbra/zimbraMail/share/view/ZmActionMenu";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";
import {IdGenerator} from "../IdGenerator";
import {GroupTreeItem} from "./GroupTreeItem";

export class GroupTreeItemActionMenuFactory {

  public static AddMenuItemPlugin: string = "GroupTreeItem Action Menu Add Menu Entry";

  public static createMenu(treeItem: GroupTreeItem, mainWindowPluginManager: ChatPluginManager): DwtMenu {
    let menu = null;
    if (treeItem.getGroup().getName() === "") {
      return null;
    }
    if (Version.isZ8Up()) {
      menu = new GroupTreeItemActionMenu8(treeItem);
    } else {
      menu = new GroupTreeItemActionMenu7(treeItem);
    }
    if (menu === null) {
      return null;
    }
    const optRename = new DwtMenuItem({
      id: IdGenerator.generateId("ZxChat_GroupTreeItem_" + (treeItem.getGroup().getName()) + "_MenuItem_Rename"),
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
    });
    optRename.setText(ZmMsg.rename);
    optRename.setImage("rename");
    optRename.addSelectionListener(new AjxListener(treeItem, treeItem.renameGroupSelected));
    const optDelete = new DwtMenuItem({
      id: IdGenerator.generateId("ZxChat_GroupTreeItem_" + (treeItem.getGroup().getName()) + "_MenuItem_Delete"),
      parent: menu,
      style: DwtMenuItem.IMAGE_LEFT,
    });
    optDelete.setText(ZmMsg.del);
    optDelete.setImage("delete");
    optDelete.addSelectionListener(new AjxListener(treeItem, treeItem.deleteGroupSelected));
    mainWindowPluginManager.triggerPlugins(GroupTreeItemActionMenuFactory.AddMenuItemPlugin, menu, treeItem);
    return menu;
  }

}

interface IGroupTreeItemActionMenu {
  groupTreeItem: GroupTreeItem;
}

// tslint:disable-next-line
class GroupTreeItemActionMenu8 extends ZmActionMenu implements IGroupTreeItemActionMenu {

  public groupTreeItem: GroupTreeItem;

  constructor(groupTreeItem: GroupTreeItem) {
    super({
      id: IdGenerator.generateId("ZxChat_GroupTreeItemMenu_" + (groupTreeItem.getGroup().getName())),
      menuItems: [],
      parent: groupTreeItem,
    });
    this.groupTreeItem = groupTreeItem;
  }
}

// tslint:disable-next-line
class GroupTreeItemActionMenu7 extends DwtMenu implements IGroupTreeItemActionMenu {

  public groupTreeItem: GroupTreeItem;

  constructor(groupTreeItem: GroupTreeItem) {
    super({
      id: IdGenerator.generateId("ZxChat_GroupTreeItemMenu_" + (groupTreeItem.getGroup().getName())),
      parent: groupTreeItem,
    });
    this.groupTreeItem = groupTreeItem;
  }

}
