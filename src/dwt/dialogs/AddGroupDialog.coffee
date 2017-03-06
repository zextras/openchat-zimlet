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
    "../../zimbra/ajax/boot/AjxTemplate",
    "../../zimbra/ajax/events/AjxListener",
    "../../zimbra/ajax/dwt/widgets/DwtComposite",
    "../../zimbra/ajax/dwt/widgets/DwtDialog",
    "../../zimbra/ajax/dwt/widgets/DwtMessageDialog",
    "../../zimbra/ajax/dwt/events/DwtEvent",
    "../../zimbra/zimbraMail/share/view/dialog/ZmDialog",
    '../../client/Group',
    '../IdGenerator'
  ],
  (
    require,
    exports,
    StringUtils_1,
    AjxTemplate_1,
    AjxListener_1,
    DwtComposite_1,
    DwtDialog_1,
    DwtMessageDialog_1,
    DwtEvent_1,
    ZmDialog_1,
    Group_1,
    IdGenerator_1
  ) ->
    "use strict"
    
    AjxTemplate = AjxTemplate_1.AjxTemplate
    AjxListener = AjxListener_1.AjxListener
    DwtComposite = DwtComposite_1.DwtComposite
    DwtDialog = DwtDialog_1.DwtDialog
    DwtMessageDialog = DwtMessageDialog_1.DwtMessageDialog
    DwtEvent = DwtEvent_1.DwtEvent
    ZmDialog = ZmDialog_1.ZmDialog

    StringUtils = StringUtils_1.StringUtils

    Group = Group_1.Group
    IdGenerator = IdGenerator_1.IdGenerator

    class AddGroupDialog extends ZmDialog

      constructor: (params, client, appCtxt) ->
        params.title = StringUtils.getMessage("create_group_title")
        params.buttons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]
        params.id = IdGenerator.generateId("ZxChat_AddGroupDialog")
        super(params)
        @client = client
        @appCtxt = appCtxt
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
          view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat.Windows#AddGroupDialog", data)
        @_groupNameEl = document.getElementById("#{data.id}_group_name")
        view

      popup: () ->
        super()
        @_groupNameEl.focus()

      ###*
        Handle the action of renaming friend
        @private
      ###
      _okBtnListener: () ->
        groupName = StringUtils.trim(@_groupNameEl.value)
        if groupName is '' then return
        group = @client.getBuddyList().getGroup(groupName)
        if group?
          msgDialog = @appCtxt.getMsgDialog()
          msgDialog.setMessage(
            StringUtils.getMessage('cannote_create_group_already_exists', [groupName])
            DwtMessageDialog.WARNING_STYLE
          )
          msgDialog.popup()
        else
          @client.getBuddyList().addGroup(new Group(groupName))
          @popdown()

      cleanInput: () ->
        @_groupNameEl.value = ''

    exports.AddGroupDialog = AddGroupDialog
    return
)