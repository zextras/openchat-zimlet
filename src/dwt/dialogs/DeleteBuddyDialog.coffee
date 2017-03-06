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
    "../../zimbra/ajax/events/AjxListener",
    "../../zimbra/ajax/dwt/widgets/DwtDialog"
    "../../zimbra/ajax/dwt/widgets/DwtMessageDialog"
    "../../zimbra/ajax/dwt/events/DwtEvent"
    '../IdGenerator'
  ],
  (
    require,
    exports,
    StringUtils_1,
    AjxListener_1,
    DwtDialog_1,
    DwtMessageDialog_1,
    DwtEvent_1,
    IdGenerator_1
  ) ->
    "use strict"
    
    AjxListener = AjxListener_1.AjxListener
    DwtDialog = DwtDialog_1.DwtDialog
    DwtMessageDialog = DwtMessageDialog_1.DwtMessageDialog
    DwtEvent = DwtEvent_1.DwtEvent

    IdGenerator = IdGenerator_1.IdGenerator

    StringUtils = StringUtils_1.StringUtils

    class DeleteBuddyDialog extends DwtMessageDialog

      ###*
        @param {DwtShell} shell
        @param {ChatClient} client
        @param {Callback} callback
      ###
      constructor: (shell, client, callback) ->
        super({
          parent: shell
          buttons: [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]
          id: IdGenerator.generateId("ZxChat_DeleteBuddyDialog")
        })
        @client = client
        @onDeletedCallback = callback
        @clear()
        @setTitle(StringUtils.getMessage("delete_friends_title"))
        @setButtonListener(
          DwtDialog.YES_BUTTON,
          new AjxListener(@, @_yesBtnListener)
        )
        @addListener(
          DwtEvent.ENTER
          new AjxListener(@, @_yesBtnListener)
        )

      _yesBtnListener: () ->
        if typeof @buddy isnt "undefined"
          @client.deleteFriendship(@buddy, @onDeletedCallback)
        @popdown()

      @getDialog: (shell, client, callback) ->
        if not DeleteBuddyDialog._dialog?
          DeleteBuddyDialog._dialog = new DeleteBuddyDialog(shell, client, callback)
        DeleteBuddyDialog._dialog.clear()
        DeleteBuddyDialog._dialog
        
      ###*
        @param {Buddy} buddy
      ###
      setBuddy: (buddy) ->
        @buddy = buddy
        DeleteBuddyDialog._dialog.setMessage(
          StringUtils.getMessage("delete_friends_text", [buddy.getNickname()]),
          DwtMessageDialog.WARNING_STYLE
        )

      ###*
        Clear the DeleteBuddyDialog internals.
      ###
      clear: () ->
        @buddy = undefined
        @setMessage(
          StringUtils.getMessage("delete_friends_text", [""]),
          DwtMessageDialog.WARNING_STYLE
        )

    exports.DeleteBuddyDialog = DeleteBuddyDialog
    return
)
