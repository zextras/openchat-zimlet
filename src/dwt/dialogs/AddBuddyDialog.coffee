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
    '../../lib/log/LogEngine',
    '../../lib/StringUtils',
    '../../lib/ArrayUtils',
    "../../zimbra/ajax/events/AjxListener",
    "../../zimbra/ajax/boot/AjxTemplate",
    "../../zimbra/ajax/dwt/widgets/DwtComposite"
    "../../zimbra/ajax/dwt/widgets/DwtDialog"
    "../../zimbra/ajax/dwt/widgets/DwtMessageDialog"
    "../../zimbra/ajax/dwt/events/DwtEvent"
    "../../zimbra/zimbraMail/share/view/dialog/ZmDialog"
    "../../zimbra/zimbraMail/share/view/ZmAutocompleteListView"
    "../../zimbra/zimbraMail/share/model/ZmAutocomplete"
    '../IdGenerator',
    '../../client/BuddyStatusType'
  ],
  (
    require,
    exports,
    LogEngine_1,
    StringUtils_1,
    ArrayUtils_1,
    AjxListener_1,
    AjxTemplate_1,
    DwtComposite_1,
    DwtDialog_1,
    DwtMessageDialog_1,
    DwtEvent_1,
    ZmDialog_1,
    ZmAutocompleteListView_1,
    ZmAutocomplete_1,
    IdGenerator_1,
    BuddyStatusType_1
  ) ->
    "use strict"
    
    AjxListener = AjxListener_1.AjxListener
    AjxTemplate = AjxTemplate_1.AjxTemplate
    DwtComposite = DwtComposite_1.DwtComposite
    DwtDialog = DwtDialog_1.DwtDialog
    DwtMessageDialog = DwtMessageDialog_1.DwtMessageDialog
    DwtEvent = DwtEvent_1.DwtEvent
    ZmDialog = ZmDialog_1.ZmDialog
    ZmAutocompleteListView = ZmAutocompleteListView_1.ZmAutocompleteListView
    ZmAutocomplete = ZmAutocomplete_1.ZmAutocomplete

    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)
    StringUtils = StringUtils_1.StringUtils
    ArrayUtils = ArrayUtils_1.ArrayUtils
    IdGenerator = IdGenerator_1.IdGenerator
    BuddyStatusType = BuddyStatusType_1.BuddyStatusType

    class AddBuddyDialog extends ZmDialog

      constructor: (params, client, appCtxt, userAliases) ->
        if not params.enableAutoComplete? then params.enableAutoComplete = false
        params.title = StringUtils.getMessage("add_friends_title")
        params.buttons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]
        params.id = IdGenerator.generateId("ZxChat_AddBuddyDialog")
        super(params)
        @client = client
        @appCtxt = appCtxt
        @userAliases = userAliases
        @setView(@_createDialogView())
        @setButtonListener(
          DwtDialog.OK_BUTTON,
          new AjxListener(@, @_okBtnListener)
        )
        @addListener(
          DwtEvent.ENTER
          new AjxListener(@, @_okBtnListener)
        )
        if params.enableAutoComplete
          @_initAutoComplete(params.parent, params.dataClass)

      ###*
        Create the dialog using the template
        @private
      ###
      _createDialogView: () ->
        data = {
          id: @_htmlElId
          msg_email: StringUtils.getMessage("add_friends_email")
          msg_nickname: StringUtils.getMessage("add_friends_username")
        }
        view = new DwtComposite(@)
        if view.getHtmlElement()?
          view.getHtmlElement().style.overflow = "auto"
          view.getHtmlElement().innerHTML = AjxTemplate.expand("com_zextras_chat.Windows#AddBuddyDialog", data)
        @_buddyAddressEl = document.getElementById("#{data.id}_email")
        @_buddyNicknameEl = document.getElementById("#{data.id}_nickname")
        view

      popup: () ->
        super()
        @_buddyAddressEl.focus()

      ###*
        Initialize the auto-completer on the mail field.
        @param {DwtShell} parent
        @param {ZmAutocomplete} autoCompleter
        @private
      ###
      _initAutoComplete: (parent, autoCompleter) ->
        acAddrSelectList = new ZmAutocompleteListView({
          parent: parent
          dataClass: autoCompleter
          matchValue: ZmAutocomplete.AC_VALUE_EMAIL
    #      compCallback: (new AjxCallback(@zimletInstance, @zimletInstance._acCompHandler))
        })
        acAddrSelectList.handle(@_buddyAddressEl)
        acAddrSelectList.addCallback(
          ZmAutocompleteListView.CB_COMPLETION,
          new AjxListener(@, @_autocompleteListener)
        )

      _autocompleteListener: (address, el, match) ->
        Log.debug("Address: " + address)
        name = ''
        if match?
          name = match.name
        if name == ''
          name = address.substr(0, ArrayUtils.indexOf(address, '@'))
        @_buddyNicknameEl.value = name
        @_buddyNicknameEl.focus()

      ###*
        Function invoked when the ok button is pressed
        @private
      ###
      _okBtnListener: () ->
        buddyId = @_buddyAddressEl.value.replace(/([^ ;,:]*@[^ ;,:]*).*/, '$1')
        nickname = @_buddyNicknameEl.value
        group = ""
        if buddyId == "peppy@zextras.com"
          @popdown()
          @client._enablePeppy(true)
          return
        buddy =  @client.getBuddyList().getBuddyById(buddyId)
        if buddy? and buddy.getStatus().getType() != BuddyStatusType.INVITED
          @popdown()
          msgDialog = @appCtxt.getMsgDialog()
          msgDialog.setMessage(StringUtils.getMessage('friend_already_added'))
          msgDialog.popup()
        else if (buddyId in @userAliases) or (buddyId == @username) or (buddyId is "")
          @popdown()
          msgDialog = @appCtxt.getMsgDialog()
          msgDialog.setMessage(
            StringUtils.getMessage('err_adding_friend')
            DwtMessageDialog.WARNING_STYLE
          )
          msgDialog.popup()
        else
          @popdown()
          @client.sendFriendship(
            buddyId
            nickname
            group
          )

      cleanInput: () ->
        @_buddyAddressEl.value = ''
        @_buddyNicknameEl.value = ''

    exports.AddBuddyDialog = AddBuddyDialog
    return
)