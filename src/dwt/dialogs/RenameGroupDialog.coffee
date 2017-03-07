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
    "../../zimbra/ajax/boot/AjxTemplate",
    "../../zimbra/ajax/dwt/widgets/DwtComposite"
    "../../zimbra/ajax/dwt/widgets/DwtDialog"
    "../../zimbra/ajax/dwt/widgets/DwtMessageDialog"
    "../../zimbra/ajax/dwt/events/DwtEvent"
    "../../zimbra/zimbraMail/share/view/dialog/ZmDialog"
    '../IdGenerator'
  ],
  (
    require,
    exports,
    StringUtils_1,
    AjxListener_1,
    AjxTemplate_1,
    DwtComposite_1,
    DwtDialog_1,
    DwtMessageDialog_1,
    DwtEvent_1,
    ZmDialog_1,
    IdGenerator_1
  ) ->
    "use strict"
    
    AjxListener = AjxListener_1.AjxListener
    AjxTemplate = AjxTemplate_1.AjxTemplate
    DwtComposite = DwtComposite_1.DwtComposite
    DwtDialog = DwtDialog_1.DwtDialog
    DwtMessageDialog = DwtMessageDialog_1.DwtMessageDialog
    DwtEvent = DwtEvent_1.DwtEvent
    ZmDialog = ZmDialog_1.ZmDialog

    StringUtils = StringUtils_1.StringUtils

    IdGenerator = IdGenerator_1.IdGenerator

    class RenameGroupDialog extends ZmDialog

      constructor: (params, client, appCtxt, group) ->
        params.title = StringUtils.getMessage("rename_group_title")
        params.buttons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]
        params.id = IdGenerator.generateId("ZxChat_RenameGroupDialog_#{group.getName()}")
        @client = client
        @appCtxt = appCtxt
        @group = group
        super(params)
        @setView(@_createDialogView())
        @setButtonListener(
          DwtDialog.OK_BUTTON,
          new AjxListener(@, @_okBtnListener)
        )
        @addListener(
          DwtEvent.ENTER
          new AjxListener(@, @_okBtnListener)
        )

      ###*
        Create the dialog using the template
        @private
      ###
      _createDialogView: () ->
        data = {
          id: @_htmlElId
          msg_group_name: StringUtils.getMessage("create_group_name")
        }
        view = new DwtComposite(@)
        if view.getHtmlElement()?
          view.getHtmlElement().style.overflow = "auto"
          view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat_open.Windows#AddGroupDialog", data)
        @_groupNameEl = document.getElementById("#{data.id}_group_name")
        @_groupNameEl.value = @group.getName()
        view

      popup: () ->
        super()
        @_groupNameEl.focus()

      ###*
        Handle the action of renaming friend
        @private
      ###
      _okBtnListener: () ->
        newName = StringUtils.trim(@_groupNameEl.value)
        group = @client.getBuddyList().getGroup(newName)
        if group?
          msgDialog = @appCtxt.getMsgDialog()
          msgDialog.setMessage(
            StringUtils.getMessage('cannote_create_group_already_exists', [newName])
            DwtMessageDialog.WARNING_STYLE
          )
          msgDialog.popup()
        else
          oldName = @group.getName()
          @group.setName(newName)
          @client.renameGroup(oldName, newName)
          @popdown()

    exports.RenameGroupDialog = RenameGroupDialog
    return
)