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

import {
  DwtToolBarButton,
  DwtToolBar
} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {Callback} from "../../lib/callbacks/Callback";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";

export declare class MainMenuButton extends DwtToolBarButton {

  public static ADD_BUDDY_MENU_ITEM_ID: string;
  public static ADD_GROUP_MENU_ITEM_ID: string;
  public static SWITCH_TO_SIDEBAR_MENU_ITEM_ID: string;
  public static SWITCH_TO_DOCK_MENU_ITEM_ID: string;
  public static HIDE_OFFLINE_BUDDIES_MENU_ITEM_ID: string;
  public static OPEN_PREFERENCES_MENU_ITEM_ID: string;

  public static AddMenuItemPlugin: string;

  constructor(
    toolbar: DwtToolBar,
    mainWindowPluginManager: ChatPluginManager
  )

  public enableDisableCreateChatRoom(enable: boolean): void;
  public onAddFriendSelection(callback: Callback): void;
  public onAddGroupSelection(callback: Callback): void;
  public onCreateMultiChatRoomSelection(callback: Callback): void;
  public onSettingsSelection(callback: Callback): void;
  public onShowHideOffline(callback: Callback): void;
  public setHideOfflineButtonStatus(hide: boolean): void;
  public onChangeSidebarOrDock(callback: Callback): void;
  public setSwitchOnSidebarStatus(onSidebar: boolean): void;

}
