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
    '../../lib/StringUtils',
    '../../lib/Version',
    '../../zimbra/ajax/events/AjxListener'
    '../../zimbra/ajax/dwt/widgets/DwtMenu'
    '../../zimbra/ajax/dwt/widgets/DwtMenuItem'
    '../../zimbra/zimbraMail/share/view/ZmActionMenu'
    '../../client/BuddyStatusType'
    '../IdGenerator'
  ],
  (
    require,
    exports,
    StringUtils_1,
    Version_1,
    AjxListener_1,
    DwtMenu_1,
    DwtMenuItem_1,
    ZmActionMenu_1,
    BuddyStatusType_1,
    IdGenerator_1
  ) ->
    "use strict"
    
    AjxListener = AjxListener_1.AjxListener
    DwtMenu = DwtMenu_1.DwtMenu
    DwtMenuItem = DwtMenuItem_1.DwtMenuItem
    ZmActionMenu = ZmActionMenu_1.ZmActionMenu

    StringUtils = StringUtils_1.StringUtils
    Version = Version_1.Version

    BuddyStatusType = BuddyStatusType_1.BuddyStatusType
    IdGenerator = IdGenerator_1.IdGenerator

    class BuddyTreeItemActionMenuFactory

      @AddMenuItemPlugin = "BuddyTreeItem Action Menu Add Menu Entry"

      ###*
        Build the action menu for a BuddyTreeItem object
        @param {BuddyTreeItem} treeItem
        @param {ChatPluginManager} mainWindowPluginManager
        @return {BuddyTreeItemActionMenu7|BuddyTreeItemActionMenu8}
      ###
      @createMenu: (treeItem, mainWindowPluginManager) ->
        buddy = treeItem.getBuddy()
        menu = null
        if Version.isZ8Up()
          menu = new BuddyTreeItemActionMenu8(treeItem)
        else
          menu = new BuddyTreeItemActionMenu7(treeItem)

        if menu == null
          return

        menu.optRename = new DwtMenuItem({
          parent: menu
          style: DwtMenuItem.IMAGE_LEFT
          id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_Rename")
        })
        menu.optRename.setText(StringUtils.getMessage('friend_rename'))
        menu.optRename.setImage('ZxChat_renameFriend')
        menu.optRename.addSelectionListener(new AjxListener(treeItem, treeItem._onRenameBuddy))
        menu.optRename.setEnabled(true, true)

        if buddy.getStatus().getType() == BuddyStatusType.INVITED
          menu.optSendInvitation = new DwtMenuItem({
            parent: menu
            style: DwtMenuItem.IMAGE_LEFT
            id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_Send_Invitation")
          })
          menu.optSendInvitation.setText(StringUtils.getMessage('resend_invite'))
          menu.optSendInvitation.setImage('ZxChat_addBuddy')
          menu.optSendInvitation.addSelectionListener(new AjxListener(treeItem, treeItem._onSendInvitation))
          menu.optSendInvitation.setEnabled(buddy.getStatus().getType() == BuddyStatusType.INVITED, true)
          menu.optSendInvitation.setVisible(buddy.getStatus().getType() == BuddyStatusType.INVITED)

        if buddy.getStatus().getType() == BuddyStatusType.NEED_RESPONSE
          menu.optAcceptInvitation = new DwtMenuItem({
            parent: menu
            style: DwtMenuItem.IMAGE_LEFT
            id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_Accept_Invitation")
          })
          menu.optAcceptInvitation.setText(StringUtils.getMessage('accept_invitation'))
          menu.optAcceptInvitation.setImage('ZxChat_addBuddy')
          menu.optAcceptInvitation.addSelectionListener(new AjxListener(treeItem, treeItem._onAcceptInvitation))
          menu.optAcceptInvitation.setEnabled(buddy.getStatus().getType() == BuddyStatusType.NEED_RESPONSE, true)
          menu.optAcceptInvitation.setVisible(buddy.getStatus().getType() == BuddyStatusType.NEED_RESPONSE)

        menu.optDelete = new DwtMenuItem({
          parent: menu
          style: DwtMenuItem.IMAGE_LEFT
          id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_Delete")
        })
        menu.optDelete.setText(StringUtils.getMessage('friend_delete'))
        menu.optDelete.setImage('ZxChat_removeFriend')
        menu.optDelete.addSelectionListener(new AjxListener(treeItem, treeItem._onDeleteBuddy))
        menu.optDelete.setEnabled(true, true)

        mainWindowPluginManager.triggerPlugins(BuddyTreeItemActionMenuFactory.AddMenuItemPlugin, menu, treeItem)
#        menu.optNewMail = new DwtMenuItem({
#          parent: menu
#          style: DwtMenuItem.IMAGE_LEFT
#          id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_New_Mail")
#        })
#        menu.optNewMail.setText(ZmMsg.newEmail)
#        menu.optNewMail.setImage('ZxChat_new-email')
#        menu.optNewMail.addSelectionListener(new AjxListener(treeItem, treeItem._sendNewMail))
#        menu.optNewMail.setEnabled(true, true)
#
#        menu.optSearch = new DwtMenuItem({
#          parent: menu
#          style: DwtMenuItem.IMAGE_LEFT
#          id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{buddy.getId()}_MenuItem_Search")
#        })
#        menu.optSearch.setText(StringUtils.getMessage('friend_history'))
#        menu.optSearch.setImage('ZxChat_history')
#        menu.optSearch.addSelectionListener(new AjxListener(treeItem, treeItem._showHistory))
#        menu.optSearch.setEnabled(true, true)
#        menu.enableDisableHistoryOpt(treeItem.isHistoryEnabled())

        menu

    ###*
      Action menu used for Zimbra 8 compatibility
      @private
    ###
    class BuddyTreeItemActionMenu8 extends ZmActionMenu
      constructor: (buddyTreeItem) ->
        @buddyTreeItem = buddyTreeItem
        super({
          parent: @buddyTreeItem
          menuItems: []
          id: IdGenerator.generateId("ZxChat_BuddyTreeItem_ActionMenu_#{@buddyTreeItem.getBuddy().getId()}")
        })

#      ###*
#        Enable or disable the history option on the context menu.
#        @param {boolean} enable
#      ###
#      enableDisableHistoryOpt: (enable) ->
#        @optSearch.setVisible(enable)
#        @optSearch.setEnabled(enable)

    ###*
      Action menu used for Zimbra 7 compatibility
      @private
    ###
    class BuddyTreeItemActionMenu7 extends DwtMenu
      constructor: (buddyTreeItem) ->
        @buddyTreeItem = buddyTreeItem
        super({
          parent: @buddyTreeItem
          id: IdGenerator.generateId("ZxChat_BuddyTreeItem_ActionMenu_#{@buddyTreeItem.getBuddy().getId()}")
        })

#      ###*
#        Enable or disable the history option on the context menu.
#        @param {boolean} enable
#      ###
#      enableDisableHistoryOpt: (enable) ->
#        @optSearch.setVisible(enable)
#        @optSearch.setEnabled(enable)

    exports.BuddyTreeItemActionMenuFactory = BuddyTreeItemActionMenuFactory
    return
)
