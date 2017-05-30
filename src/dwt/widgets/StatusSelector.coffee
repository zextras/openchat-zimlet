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
    "require"
    "exports"
    '../../lib/log/LogEngine'
    '../../lib/callbacks/CallbackManager'
    '../../zimbra/ajax/events/AjxListener'
    '../../zimbra/ajax/dwt/widgets/DwtLabel'
    '../../zimbra/ajax/dwt/widgets/DwtMenuItem'
    '../../zimbra/ajax/dwt/widgets/DwtToolBar'
    '../../zimbra/zimbraMail/share/view/ZmPopupMenu'
    '../../lib/ZimbraUtils'
  ],
  (
    require
    exports
    LogEngine_1
    CallbackManager_1
    AjxListener_1
    DwtLabel_1
    DwtMenuItem_1
    DwtToolBar_1
    ZmPopupMenu_1
    ZimbraUtils_1
  ) ->
    "use strict"
    
    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)
    CallbackManager = CallbackManager_1.CallbackManager

    AjxListener = AjxListener_1.AjxListener
    DwtLabel = DwtLabel_1.DwtLabel
    DwtMenuItem = DwtMenuItem_1.DwtMenuItem
    DwtToolBarButton = DwtToolBar_1.DwtToolBarButton
    ZmPopupMenu = ZmPopupMenu_1.ZmPopupMenu
    ZimbraUtils = ZimbraUtils_1.ZimbraUtils

    class StatusSelector extends DwtToolBarButton

      @_DATA_STATUS = "status"

      constructor: (parent) ->
        super({
          parent: parent
          className: "ZToolbarButton ZNewButton"
        })
        # TODO: Dirty hack to modify the title label classname
        document.getElementById(@getHTMLElId() + "_title").className += " ChatStatusSelectorTitle#{ if !ZimbraUtils.isUniversalUI() then '-legacy-ui' else '' }"
        @dontStealFocus()
        @onStatusSelectedCbkMgr = new CallbackManager()
        @setAlign(DwtLabel.ALIGN_LEFT)
        @menu = new ZmPopupMenu(@, "ActionMenu ChatStatusSelector#{ if !ZimbraUtils.isUniversalUI() then '-legacy-ui' else '' }")
        @setMenu(@menu)

      ###*
        Clear the options in the status menu
      ###
      clear: () ->
        @menu = new ZmPopupMenu(@, "ActionMenu ChatStatusSelector#{ if !ZimbraUtils.isUniversalUI() then '-legacy-ui' else '' }")
        @setMenu(@menu)

      ###*
        Set a callback which will be invoked when a status is selected from the
        status selector
        @param {Callback} callback
      ###
      onStatusSelected: (callback) ->
        @onStatusSelectedCbkMgr.addCallback(callback)

      setOptionStatuses: (statuses) ->
        for status in statuses
          item = @menu.createMenuItem(
            "DwtStatusMenuItem_#{status.getId()}",
            {
              text: status.getMessage(true)
              style: DwtMenuItem.RADIO_STYLE
              image: status.getCSS()
              enabled: true
            }
          )
          item.setData(StatusSelector._DATA_STATUS, status)
          item.addSelectionListener(new AjxListener(@, @_statusSelected, [status]))

      setCurrentStatus: (status) ->
        @setText(status.getMessage(true))
        menuItems = @menu.getMenuItems()
        for item of menuItems
          itemStatus = menuItems[item].getData(StatusSelector._DATA_STATUS)
          menuItems[item]._setChecked(status.getId().toString() is itemStatus.getId(), null, true)

      ###*
        Notify the status selection to the callbacks set
        @param {BuddyStatus}
        @private
      ###
      _statusSelected: (status) ->
        Log.debug(status, "Status Changed")
        @onStatusSelectedCbkMgr.run(status)

    exports.StatusSelector = StatusSelector
    return
)
