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
    '../../zimbra/ajax/dwt/widgets/DwtToolBar',
    '../../zimbra/zimbraMail/share/view/ZmPopupMenu'
  ],
  (
    require,
    exports,
    DwtToolBar_1,
    ZmPopupMenu_1
  ) ->
    "use strict"
    
    DwtToolBarButton = DwtToolBar_1.DwtToolBarButton
    ZmPopupMenu = ZmPopupMenu_1.ZmPopupMenu

    class RoomWindowMenuButton extends DwtToolBarButton

      @AddMenuItemPlugin = "Room Window Menu Button Add Menu Entry"

      @_KEY_HIDE_OFFILINE = "hideOfflineBuddies"

      constructor: (roomWindow, parent, roomWindowPluginManager) ->
        @roomWindow = roomWindow
        super({
          parent: parent
          className: "ZxChat_Button ZxChat_TitleBar_Button ZToolbarButton"
        })
        @dontStealFocus()

        menu = new ZmPopupMenu(@, "ActionMenu ZmPopupMenu_ZxChat_MainMenu")
        roomWindowPluginManager.triggerPlugins(RoomWindowMenuButton.AddMenuItemPlugin, menu)
        @setMenu(menu, false, false, true)
        if menu.getItemCount() is 0
          @setVisible(false)

    exports.RoomWindowMenuButton = RoomWindowMenuButton
    return
)