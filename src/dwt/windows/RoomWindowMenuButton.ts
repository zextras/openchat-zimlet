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

import {DwtToolBarButton} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {RoomWindow} from "./RoomWindow";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";
import {WindowBase, ZxPopupMenu} from "./WindowBase";

export class RoomWindowMenuButton extends DwtToolBarButton {

  public static AddMenuItemPlugin = "Room Window Menu Button Add Menu Entry";
  public static _KEY_HIDE_OFFILINE = "hideOfflineBuddies";
  private mRoomWindow: RoomWindow;
  private mMenu: ZxPopupMenu;

  constructor(
    roomWindow: RoomWindow,
    parent: DwtComposite,
    roomWindowPluginManager: ChatPluginManager
  ) {
    super({
      parent: parent,
      className: `ZxChat_Button ZxChat_TitleBar_Button${ZimbraUtils.isUniversalUI() ? "" : "_legacy"} ZToolbarButton`
    });
    this.mRoomWindow = roomWindow;
    if (ZimbraUtils.isUniversalUI()) {
      this.setImage("MoreVertical,color=#b4d7eb");
    }
    else {
      this.setImage("ZxChat_preferences");
    }
    this.setDropDownImages("", "", "", "");
    this.dontStealFocus();

    this.mMenu = new ZxPopupMenu(this, "ActionMenu ZmPopupMenu_ZxChat_MainMenu");
    roomWindowPluginManager.triggerPlugins(RoomWindowMenuButton.AddMenuItemPlugin, this.mMenu);
    this.setMenu(this.mMenu, false, false, true);
    if (this.mMenu.getItemCount() === 0) {
      this.setVisible(false);
    }
  }

}
