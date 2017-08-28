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

import {DwtToolBarButton, DwtToolBar} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {StringUtils} from "../../lib/StringUtils";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {Callback} from "../../lib/callbacks/Callback";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {ZxPopupMenu} from "../windows/WindowBase";

export class MainMenuButton extends DwtToolBarButton {

  public static AddMenuItemPlugin: string = "Main Window Menu Button Add Menu Entry";
  public static ADD_BUDDY_MENU_ITEM_ID: string = "ZxChat_MenuItem_AddBuddy";
  public static ADD_GROUP_MENU_ITEM_ID: string = "ZxChat_MenuItem_AddGroup";
  public static SWITCH_TO_SIDEBAR_MENU_ITEM_ID: string = "ZxChat_MenuItem_SwitchToSidebar";
  public static SWITCH_TO_DOCK_MENU_ITEM_ID: string = "ZxChat_MenuItem_SwitchToDock";
  public static HIDE_OFFLINE_BUDDIES_MENU_ITEM_ID: string = "ZxChat_MenuItem_HideOfflineBuddies";
  public static OPEN_PREFERENCES_MENU_ITEM_ID: string = "ZxChat_MenuItem_OpenPreferences";
  private static _KEY_HIDE_OFFILINE: string = "hideOfflineBuddies";

  private onAddFriendSelectionCbkMgr: CallbackManager;
  private onAddGroupSelectionCbkMgr: CallbackManager;
  private onCreateMultiChatRoomSelectionCbkMgr: CallbackManager;
  private onShowHideOfflineCbkMgr: CallbackManager;
  private onSettingsSelectionCbkMgr: CallbackManager;
  private onChangeSidebarOrDockCbkMgr: ((docked: boolean) => void)[];
  private opAddBuddy: DwtMenuItem;
  private opAddGroup: DwtMenuItem;
  private opSHOffline: DwtMenuItem;
  private opSettings: DwtMenuItem;
  private mOpSwitchToDock: DwtMenuItem;
  private mOpSwitchToSidebar: DwtMenuItem;

  constructor(parent: DwtToolBar, mainWindowPluginManager: ChatPluginManager, image: string) {
    super({
      parent: parent,
      className: `ZxChat_Button ZxChat_TitleBar_Button${ZimbraUtils.isUniversalUI() ? "" : "_legacy"} ZToolbarButton`
    });
    this.setImage(image);
    this.setDropDownImages("", "", "", "");
    this.dontStealFocus();
    this.onAddFriendSelectionCbkMgr = new CallbackManager();
    this.onAddGroupSelectionCbkMgr = new CallbackManager();
    this.onCreateMultiChatRoomSelectionCbkMgr = new CallbackManager();
    this.onShowHideOfflineCbkMgr = new CallbackManager();
    this.onSettingsSelectionCbkMgr = new CallbackManager();
    this.onChangeSidebarOrDockCbkMgr = [];
    const menu = new ZxPopupMenu(this, "ActionMenu", "ZmPopupMenu_ZxChat_MainMenu");
    this.opAddBuddy = menu.createMenuItem(
      MainMenuButton.ADD_BUDDY_MENU_ITEM_ID,
      {
        text: StringUtils.getMessage("add_friend"),
      }
    );
    this.opAddBuddy.addSelectionListener(
      new AjxListener(this, this._onAddFriendSelected, [])
    );
    this.opAddGroup = menu.createMenuItem(
      MainMenuButton.ADD_GROUP_MENU_ITEM_ID,
      {
        text: StringUtils.getMessage("create_group_title"),
      }
    );
    this.opAddGroup.addSelectionListener(
      new AjxListener(this, this._onAddGroupSelected, [])
    );
    menu.createSeparator();
    this.mOpSwitchToSidebar = menu.createMenuItem(
      MainMenuButton.SWITCH_TO_SIDEBAR_MENU_ITEM_ID,
      {
        text: StringUtils.getMessage("switch_to_sidebar")
      }
    );
    this.mOpSwitchToSidebar.addSelectionListener(
       new AjxListener(this, this._onSwitchToSidebar, [])
    );
    this.mOpSwitchToDock = menu.createMenuItem(
      MainMenuButton.SWITCH_TO_DOCK_MENU_ITEM_ID,
      {
        text: StringUtils.getMessage("switch_to_docked")
      }
    );
    this.mOpSwitchToDock.addSelectionListener(
      new AjxListener(this, this._onSwitchToDock, [])
    );
    this.mOpSwitchToDock.setVisible(false);
    this.opSHOffline = menu.createMenuItem(
      MainMenuButton.HIDE_OFFLINE_BUDDIES_MENU_ITEM_ID,
      {
        text: StringUtils.getMessage("pref_title_hide_offline_buddies")
      }
    );
    this.opSHOffline.addSelectionListener(
      new AjxListener(this, this._onShowHideOffline, [])
    );
    this.opSHOffline.setData(
      MainMenuButton._KEY_HIDE_OFFILINE,
      false
    );
    menu.createSeparator();
    this.opSettings = menu.createMenuItem(
      MainMenuButton.OPEN_PREFERENCES_MENU_ITEM_ID,
      {
        text: ZmMsg.preferences
      }
    );
    this.opSettings.addSelectionListener(
      new AjxListener(this, this._onSettingsSelected, [])
    );
    mainWindowPluginManager.triggerPlugins(MainMenuButton.AddMenuItemPlugin, menu);
    this.setMenu(menu);
    Dwt.delClass(this.getHtmlElement(), "ZHasDropDown");
  }

  /**
   * Set the status of the button used for the "Hide offline buddies"
   * The status is saved internally on the menu option.
   * @param {boolean} hide
   */
  public setHideOfflineButtonStatus(hide: boolean): void {
    this.opSHOffline.setData(
      MainMenuButton._KEY_HIDE_OFFILINE,
      hide
    );
    if (hide) {
      this.opSHOffline.setText(StringUtils.getMessage("pref_title_show_offline_buddies"));
    } else {
      this.opSHOffline.setText(StringUtils.getMessage("pref_title_hide_offline_buddies"));
    }
  }

  public _onAddFriendSelected(): void {
    this.onAddFriendSelectionCbkMgr.run();
  }

  public onAddFriendSelection(callback: Callback): void {
    this.onAddFriendSelectionCbkMgr.addCallback(callback);
  }

  public _onAddGroupSelected(): void {
    this.onAddGroupSelectionCbkMgr.run();
  }

  public onAddGroupSelection(callback: Callback): void {
    this.onAddGroupSelectionCbkMgr.addCallback(callback);
  }

  public _onCreateMultiChatRoomSelected(): void {
    this.onCreateMultiChatRoomSelectionCbkMgr.run();
  }

  public onCreateMultiChatRoomSelection(callback: Callback): void {
    this.onCreateMultiChatRoomSelectionCbkMgr.addCallback(callback);
  }

  public _onShowHideOffline(): void {
    this.onShowHideOfflineCbkMgr.run(!this.opSHOffline.getData(MainMenuButton._KEY_HIDE_OFFILINE));
  }

  public onShowHideOffline(callback: Callback): void {
    this.onShowHideOfflineCbkMgr.addCallback(callback);
  }

  public _onSettingsSelected(): void {
    this.onSettingsSelectionCbkMgr.run();
  }

  public onSettingsSelection(callback: Callback): void {
    this.onSettingsSelectionCbkMgr.addCallback(callback);
  }

  /**
   * Set the sidebar/docked status of the menu selections
   * @param {boolean} onSidebar
   */
  public setSwitchOnSidebarStatus(onSidebar: boolean): void {
    if (onSidebar) {
      this.mOpSwitchToDock.setVisible(true);
      this.mOpSwitchToSidebar.setVisible(false);
    } else {
      this.mOpSwitchToDock.setVisible(false);
      this.mOpSwitchToSidebar.setVisible(true);
    }
  }

  /**
   * Handle the selection of the option "On sidebar"
   * @private
   */

  private _onSwitchToSidebar(): void {
    this.mOpSwitchToDock.setVisible(true);
    this.mOpSwitchToSidebar.setVisible(false);
    for (let cbk of this.onChangeSidebarOrDockCbkMgr) cbk(false);
  }

  /**
   * Handle the selection of the option "On dock"
   * @private
   */
  private _onSwitchToDock(): void {
    this.mOpSwitchToDock.setVisible(false);
    this.mOpSwitchToSidebar.setVisible(true);
    for (let cbk of this.onChangeSidebarOrDockCbkMgr) cbk(true);
  }

  public onChangeSidebarOrDock(cbk: (docked: boolean) => void): void {
    this.onChangeSidebarOrDockCbkMgr.push(cbk);
  }

    // this.setZIndex(Math.max(this.getZIndex(), WindowBase.sMaxZIndex + 1));

  /**
   * Disable on changing status to invisible, otherwise enable
   * @param {boolean} enable
   */
  public enableDisableCreateChatRoom(enable: boolean): void {
    // this.opCreateRoom.setEnabled(enable);
  }

}
