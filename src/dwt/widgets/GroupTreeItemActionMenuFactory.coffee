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
    '../../lib/Version',
    '../../zimbra/ajax/events/AjxListener',
    '../../zimbra/ajax/dwt/widgets/DwtMenu',
    '../../zimbra/ajax/dwt/widgets/DwtMenuItem',
    '../../zimbra/zimbraMail/share/view/ZmActionMenu',
    '../IdGenerator'
  ],
  (
    require,
    exports,
    Version_1,
    AjxListener_1,
    DwtMenu_1,
    DwtMenuItem_1,
    ZmActionMenu_1,
    IdGenerator_1
  ) ->
    "use strict"
    
    AjxListener = AjxListener_1.AjxListener
    DwtMenu = DwtMenu_1.DwtMenu
    DwtMenuItem = DwtMenuItem_1.DwtMenuItem
    ZmActionMenu = ZmActionMenu_1.ZmActionMenu

    Version = Version_1.Version
    IdGenerator = IdGenerator_1.IdGenerator

    class GroupTreeItemActionMenuFactory

      @AddMenuItemPlugin = "GroupTreeItem Action Menu Add Menu Entry"

      ###*
        Build the action menu for a GroupTreeItem object
        @param {GroupTreeItem} treeItem
        @param {ChatPluginManager} mainWindowPluginManager
        @return {GroupTreeItemActionMenu7|GroupTreeItemActionMenu8}
      ###
      @createMenu: (treeItem, mainWindowPluginManager) ->
        menu = null

        if treeItem.getGroup().getName() == ""
          return null

        if Version.isZ8Up()
          menu = new GroupTreeItemActionMenu8(treeItem)
        else
          menu = new GroupTreeItemActionMenu7(treeItem)

        if menu == null
          return null

        @optRename = new DwtMenuItem({
          parent: menu
          style: DwtMenuItem.IMAGE_LEFT
          id: IdGenerator.generateId("ZxChat_GroupTreeItem_#{treeItem.getGroup().getName()}_MenuItem_Rename")
        })
        @optRename.setText(ZmMsg.rename)
        @optRename.setImage('rename')
        @optRename.addSelectionListener(new AjxListener(treeItem, treeItem._onRenameGroupSelected))

        @optDelete = new DwtMenuItem({
          parent: menu
          style: DwtMenuItem.IMAGE_LEFT
          id: IdGenerator.generateId("ZxChat_GroupTreeItem_#{treeItem.getGroup().getName()}_MenuItem_Delete")
        })
        @optDelete.setText(ZmMsg.del)
        @optDelete.setImage('delete')
        @optDelete.addSelectionListener(new AjxListener(treeItem, treeItem._onDeleteGroupSelected))

        mainWindowPluginManager.triggerPlugins(GroupTreeItemActionMenuFactory.AddMenuItemPlugin, menu, treeItem)

        menu

    ###*
      Action menu used for Zimbra 8 compatibility
      @private
    ###
    class GroupTreeItemActionMenu8 extends ZmActionMenu
      constructor: (groupTreeItem) ->
        @groupTreeItem = groupTreeItem
        super({
          parent: @groupTreeItem
          id: IdGenerator.generateId("ZxChat_GroupTreeItemMenu_#{@groupTreeItem.getGroup().getName()}")
          menuItems: []
        })

    ###*
      Action menu used for Zimbra 7 compatibility
      @private
    ###
    class GroupTreeItemActionMenu7 extends DwtMenu
      constructor: (groupTreeItem) ->
        @groupTreeItem = groupTreeItem
        super({
          parent: @groupTreeItem
          id: IdGenerator.generateId("ZxChat_GroupTreeItemMenu_#{@groupTreeItem.getGroup().getName()}")
        })

    exports.GroupTreeItemActionMenuFactory = GroupTreeItemActionMenuFactory
    return
)