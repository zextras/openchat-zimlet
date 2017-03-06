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

    class AcceptFriendshipDialog extends DwtMessageDialog

      @_dialog = null

      constructor: (params, client, buddy) ->
        @client = client
        super({
          parent: params.parent
          buttons: [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]
          id: IdGenerator.generateId("ZxChat_AcceptFriendshipDialog")
        })
        @buddy = buddy
        @setTitle(StringUtils.getMessage("accept_friends_title"))
        @setMessage(
          StringUtils.getMessage("accept_friends_text", [@buddy.getNickname()])
        )
        @setButtonListener(
          DwtDialog.YES_BUTTON,
          new AjxListener(@, @_yesBtnListener)
        )
        @addListener(
          DwtEvent.ENTER
          new AjxListener(@, @_yesBtnListener)
        )

      _yesBtnListener: () ->
        @client.acceptFriendship(@buddy)
        @popdown()

      @getDialog: (params, client, buddy) ->
        if not AcceptFriendshipDialog._dialog?
          AcceptFriendshipDialog._dialog = new AcceptFriendshipDialog(params, client, buddy)
        if buddy?
          AcceptFriendshipDialog._dialog.buddy = buddy
          AcceptFriendshipDialog._dialog.setMessage(
            StringUtils.getMessage("accept_friends_text", [buddy.getNickname()])
          )
        AcceptFriendshipDialog._dialog

    exports.AcceptFriendshipDialog = AcceptFriendshipDialog
    return
)