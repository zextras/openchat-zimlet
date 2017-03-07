#
# Copyright (C) 2017 ZeXtras S.r.l.
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation, version 2 of
# the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License.
# If not, see <http://www.gnu.org/licenses/>.
#

define(
  [
    "require",
    "exports",
    '../../lib/callbacks/CallbackManager',
    '../../lib/StringUtils',
    '../../zimbra/ajax/events/AjxListener',
    '../../zimbra/ajax/dwt/widgets/DwtToolBar',
    '../../zimbra/ajax/dwt/core/Dwt',
    '../../zimbra/zimbraMail/share/view/ZmPopupMenu',
    '../IdGenerator'
  ],
  (
    require,
    exports,
    CallbackManager_1,
    StringUtils_1,
    AjxListener_1,
    DwtToolBar_1,
    Dwt_1,
    ZmPopupMenu_1,
    IdGenerator_1
  ) ->
    "use strict"

    AjxListener = AjxListener_1.AjxListener
    DwtToolBarButton = DwtToolBar_1.DwtToolBarButton
    Dwt = Dwt_1.Dwt
    ZmPopupMenu = ZmPopupMenu_1.ZmPopupMenu

    CallbackManager = CallbackManager_1.CallbackManager
    StringUtils = StringUtils_1.StringUtils
    IdGenerator = IdGenerator_1.IdGenerator

    class MainMenuButton extends DwtToolBarButton

      @AddMenuItemPlugin = "Main Window Menu Button Add Menu Entry"

      @ADD_BUDDY_MENU_ITEM_ID = "ZxChat_MenuItem_AddBuddy"
      @ADD_GROUP_MENU_ITEM_ID = "ZxChat_MenuItem_AddGroup"
      @SWITCH_TO_SIDEBAR_MENU_ITEM_ID = "ZxChat_MenuItem_SwitchToSidebar"
      @SWITCH_TO_DOCK_MENU_ITEM_ID = "ZxChat_MenuItem_SwitchToDock"
      @HIDE_OFFLINE_BUDDIES_MENU_ITEM_ID = "ZxChat_MenuItem_HideOfflineBuddies"
      @OPEN_PREFERENCES_MENU_ITEM_ID = "ZxChat_MenuItem_OpenPreferences"

      @_KEY_HIDE_OFFILINE = "hideOfflineBuddies"

      constructor: (parent, mainWindowPluginManager) ->
        super({
          parent: parent
          className: "ZxChat_Button ZToolbarButton"
          id: IdGenerator.generateId("ZxChat_MainMenuButton")
        })
        @dontStealFocus()
        @setImage("ZxChat_preferences")
        @onAddFriendSelectionCbkMgr = new CallbackManager()
        @onAddGroupSelectionCbkMgr = new CallbackManager()
        @onCreateMultiChatRoomSelectionCbkMgr = new CallbackManager()
        @onShowHideOfflineCbkMgr = new CallbackManager()
        @onSettingsSelectionCbkMgr = new CallbackManager()
        @onChangeSidebarOrDockCbkMgr = new CallbackManager()
        menu = new ZmPopupMenu(@,"ActionMenu", "ZmPopupMenu_ZxChat_MainMenu")
        @opAddBuddy = menu.createMenuItem(
          MainMenuButton.ADD_BUDDY_MENU_ITEM_ID,
          {
            text: StringUtils.getMessage("add_friend")
            image: "ZxChat_addBuddy"
          })
        @opAddBuddy.addSelectionListener(
          new AjxListener(@, @_onAddFriendSelected, [])
        )
        @opAddGroup = menu.createMenuItem(
          MainMenuButton.ADD_GROUP_MENU_ITEM_ID,
          {
            text: StringUtils.getMessage("create_group_title")
            image: "ZxChat_addGroup"
          })
        @opAddGroup.addSelectionListener(
          new AjxListener(@, @_onAddGroupSelected, [])
        )
        menu.createSeparator()
        @opSwitchToSidebar = menu.createMenuItem(
          MainMenuButton.SWITCH_TO_SIDEBAR_MENU_ITEM_ID,
          {
            text: StringUtils.getMessage("switch_to_sidebar")
            image: "ZxChat_column_right"
          })
        @opSwitchToSidebar.addSelectionListener(
          new AjxListener(@, @_onSwitchToSidebar, [])
        )
        @opSwitchToDock = menu.createMenuItem(
          MainMenuButton.SWITCH_TO_DOCK_MENU_ITEM_ID,
          {
            text: StringUtils.getMessage("switch_to_docked")
            image: "ZxChat_column_bottom"
          })
        @opSwitchToDock.addSelectionListener(
          new AjxListener(@, @_onSwitchToDock, [])
        )
        @opSwitchToDock.setVisible(false)
        @opSHOffline = menu.createMenuItem(
          MainMenuButton.HIDE_OFFLINE_BUDDIES_MENU_ITEM_ID,
          {
            text: StringUtils.getMessage("pref_title_hide_offline_buddies")
            image: "CheckboxUnchecked"
          })
        @opSHOffline.addSelectionListener(
          new AjxListener(@, @_onShowHideOffline, [])
        )
        @opSHOffline.setData(
          MainMenuButton._KEY_HIDE_OFFILINE
          false
        )
        menu.createSeparator()
        @opSettings = menu.createMenuItem(
          MainMenuButton.OPEN_PREFERENCES_MENU_ITEM_ID,
          {
            text: ZmMsg.preferences
            image: "ZxChat_preferences"
          })
        @opSettings.addSelectionListener(
          new AjxListener(@, @_onSettingsSelected, [])
        )
        mainWindowPluginManager.triggerPlugins(MainMenuButton.AddMenuItemPlugin, menu)
        @setMenu(menu)
        Dwt.delClass(this.getHtmlElement(), "ZHasDropDown")

      ###*
        Set the status of the button used for the "Hide offline buddies"
        The status is saved internally on the menu option.
        @param {boolean} hide
      ###
      setHideOfflineButtonStatus: (hide) ->
        @opSHOffline.setData(
          MainMenuButton._KEY_HIDE_OFFILINE
          hide
        )
        if hide
          @opSHOffline.setImage("CheckboxChecked")
        else
          @opSHOffline.setImage("CheckboxUnchecked")

      _onAddFriendSelected: () ->
        @onAddFriendSelectionCbkMgr.run()

      onAddFriendSelection: (callback) ->
        @onAddFriendSelectionCbkMgr.addCallback(callback)

      _onAddGroupSelected: () ->
        @onAddGroupSelectionCbkMgr.run()

      onAddGroupSelection: (callback) ->
        @onAddGroupSelectionCbkMgr.addCallback(callback)

      _onCreateMultiChatRoomSelected: () ->
        @onCreateMultiChatRoomSelectionCbkMgr.run()

      onCreateMultiChatRoomSelection: (callback) ->
        @onCreateMultiChatRoomSelectionCbkMgr.addCallback(callback)

      _onShowHideOffline: () ->
        hide = !@opSHOffline.getData(MainMenuButton._KEY_HIDE_OFFILINE)
        @onShowHideOfflineCbkMgr.run(hide)

      onShowHideOffline: (callback) ->
        @onShowHideOfflineCbkMgr.addCallback(callback)

      _onSettingsSelected: () ->
        @onSettingsSelectionCbkMgr.run()

      onSettingsSelection: (callback) ->
        @onSettingsSelectionCbkMgr.addCallback(callback)

      ###*
        Set the sidebar/docked status of the menu selections
        @param {boolean} onSidebar
      ###
      setSwitchOnSidebarStatus: (onSidebar) ->
        if onSidebar
          @opSwitchToDock.setVisible(true)
          @opSwitchToSidebar.setVisible(false)
        else
          @opSwitchToDock.setVisible(false)
          @opSwitchToSidebar.setVisible(true)
        
      ###*
        Handle the selection of the option "On sidebar"
        @private
      ###
      _onSwitchToSidebar: () ->
        @opSwitchToDock.setVisible(true)
        @opSwitchToSidebar.setVisible(false)
        @onChangeSidebarOrDockCbkMgr.run(false)

      ###*
        Handle the selection of the option "On dock"
        @private
      ###
      _onSwitchToDock: () ->
        @opSwitchToDock.setVisible(false)
        @opSwitchToSidebar.setVisible(true)
        @onChangeSidebarOrDockCbkMgr.run(true)

      ###*
        @param {Callback} callback
      ###
      onChangeSidebarOrDock: (callback) ->
        @onChangeSidebarOrDockCbkMgr.addCallback(callback)

      ###*
        Disable on changing status to invisible, otherwise enable
        @param {boolean} enable
      ###
      enableDisableCreateChatRoom: (enable) ->
        @opCreateRoom.setEnabled(enable)

    exports.MainMenuButton = MainMenuButton
    return
)