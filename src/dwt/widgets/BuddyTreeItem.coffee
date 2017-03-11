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
    '../../lib/callbacks/Callback'
    '../../lib/callbacks/CallbackManager'
    '../../zimbra/ajax/boot/AjxDispatcher'
    '../../zimbra/ajax/events/AjxListener'
    '../../zimbra/ajax/boot/AjxCallback'
    '../../zimbra/ajax/boot/AjxTemplate'
    '../../zimbra/ajax/dwt/core/Dwt'
    '../../zimbra/ajax/dwt/dnd/DwtDragEvent'
    '../../zimbra/ajax/dwt/dnd/DwtDragSource'
    '../../zimbra/ajax/dwt/widgets/DwtTreeItem'
    './BuddyTreeItemActionMenuFactory'
    '../IdGenerator'
    '../../lib/LearningClipUtils'
  ],
  (
    require
    exports
    LogEngine_1
    Callback_1
    CallbackManager_1
    AjxDispatcher_1
    AjxListener_1
    AjxCallback_1
    AjxTemplate_1
    Dwt_1
    DwtDragEvent_1
    DwtDragSource_1
    DwtTreeItem_1
    BuddyTreeItemActionMenuFactory_1
    IdGenerator_1
    LearningClipUtils_1
  ) ->
    "use strict"
    
    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)
    Callback = Callback_1.Callback
    CallbackManager = CallbackManager_1.CallbackManager

    AjxDispatcher = AjxDispatcher_1.AjxDispatcher
    AjxListener = AjxListener_1.AjxListener
    AjxCallback = AjxCallback_1.AjxCallback
    AjxTemplate = AjxTemplate_1.AjxTemplate
    Dwt = Dwt_1.Dwt
    DwtDragEvent = DwtDragEvent_1.DwtDragEvent
    DwtDragSource = DwtDragSource_1.DwtDragSource
    DwtTreeItem = DwtTreeItem_1.DwtTreeItem
    BuddyTreeItemActionMenuFactory = BuddyTreeItemActionMenuFactory_1.BuddyTreeItemActionMenuFactory
    IdGenerator = IdGenerator_1.IdGenerator
    LearningClipUtils = LearningClipUtils_1.LearningClipUtils

    class BuddyTreeItem extends DwtTreeItem
    
      @MAX_LENGTH = 133
    
      isBuddyTreeItem: true

      constructor: (parent, buddy, appCtxt, mainWindowPluginManager) ->
        @refBuddy = buddy
        @appCtxt = appCtxt
        @mainWindowPluginManager = mainWindowPluginManager
        @hideIfOffline = false
        @historyEnabled = false
        treeText = @refBuddy.getNickname()
        if @refBuddy.getNickname().length > 19
          treeText = LearningClipUtils.clip(@refBuddy.getNickname(), BuddyTreeItem.MAX_LENGTH, "DwtTreeItem-Text")
        super({
          parent: parent
          text: treeText
          selectable: true
          id: IdGenerator.generateId("ZxChat_BuddyTreeItem_#{@refBuddy.getId()}")
          dndScrollCallback: parent._dndScrollCallback
          dndScrollId: parent._dndScrollId
        })
        @_treeItemExtraImgClass = "ZxChat_BuddyTreeItem-ExtraImg"
        @setImage(@refBuddy.getStatus().getCSS())
        @setText(treeText)
        dragSource = new DwtDragSource(Dwt.DND_DROP_MOVE)
        dragSource.addDragListener(new AjxListener(@, @_dragListener))
        @setDragSource(dragSource)
        @refBuddy.onNicknameChange(new Callback(@, @_onNicknameChange))
        @refBuddy.onStatusChange(new Callback(@, @_onStatusChange))
#        @refBuddy.onDelete(new Callback(@, @_onBuddyDelete))
        @onDeleteBuddyCallbacks = new CallbackManager()
        @onRenameBuddyCallbacks = new CallbackManager()
        @onSendInvitationCallbacks = new CallbackManager()
        @onAcceptInvitationCallbacks = new CallbackManager()
        @setToolTipContent(new AjxCallback(@, @_createTooltip))
    
      ###*
        Get the Buddy object associated to the DwtObject
        @param {Buddy}
      ###
      getBuddy: () ->
        @refBuddy
    
      ###*
        Set the visibility of the tree item
      ###
      showHideOffline: (hide) ->
        @hideIfOffline = hide
        @_updateVisibility()
    
#      ###*
#        Enable or disable the history of this buddy
#        @param {boolean} enable
#      ###
#      enableDisableHistory: (enable) ->
#        @historyEnabled = enable
#        if @actionMenu?
#          @actionMenu.enableDisableHistoryOpt(enable)
    
      ###*
        @return {boolean}
      ###
      isHistoryEnabled: () ->
        @historyEnabled
    
      ###*
        Update the visibility of the object, according to the status and the flag "hide offline"
        @private
      ###
      _updateVisibility: () ->
        if @hideIfOffline and @refBuddy.getStatus().isOffline()
          @setVisible(false, true, false)
        else
          @setVisible(true, true, false)
    
      ###*
        Callback invoked when the nickname of the buddy is changed.
        @param {string} nickname
      ###
      _onNicknameChange: (nickname) ->
        treeText = nickname
        if nickname.length > 19
          treeText = LearningClipUtils.clip(nickname, BuddyTreeItem.MAX_LENGTH, "DwtTreeItem-Text")
        @setText(treeText)
    
      ###*
        Callback invoked when the status of the user is changed.
        @private
      ###
      _onStatusChange: (buddy, status) ->
        @setImage(status.getCSS())
        @_updateVisibility()
    
      ###*
        Handle the action command, usually triggered by the right-click
        @param {DwtSelectionEvent} ev
      ###
      onAction: (ev) ->
        if not @actionMenu?
          @actionMenu = BuddyTreeItemActionMenuFactory.createMenu(@, @mainWindowPluginManager)
        @actionMenu.popup(0, ev.docX, ev.docY, false)
    
      onDeleteBuddy: (callback) ->
        @onDeleteBuddyCallbacks.addCallback(callback)
    
      ###*
        @param {DwtSelectionEvent} ev
        @private
      ###
      _onDeleteBuddy: (ev) ->
        @onDeleteBuddyCallbacks.run(@refBuddy)
    
      ###*
        @param {Callback} callback
      ###
      onRenameBuddy: (callback) ->
        @onRenameBuddyCallbacks.addCallback(callback)
    
      ###*
        @param {DwtSelectionEvent} ev
        @private
      ###
      _onRenameBuddy: (ev) ->
        @onRenameBuddyCallbacks.run(@refBuddy)
    
      ###*
        @param {Callback} callback
      ###
      onSendInvitation: (callback) ->
        @onSendInvitationCallbacks.addCallback(callback)
    
      ###*
        @param {DwtSelectionEvent} ev
        @private
      ###
      _onSendInvitation: (ev) ->
        @onSendInvitationCallbacks.run(@refBuddy)
    
      ###*
        @param {Callback} callback
      ###
      onAcceptInvitation: (callback) ->
        @onAcceptInvitationCallbacks.addCallback(callback)
    
      ###*
        @param {DwtSelectionEvent} ev
        @private
      ###
      _onAcceptInvitation: (ev) ->
        @onAcceptInvitationCallbacks.run(@refBuddy)

      ###*
        Handle the buddy deletion notified from the buddy himself
        @param {Buddy} buddy
      ###
      _onBuddyDelete: (buddy) ->
        remove = false
        for child in @parent.getChildren()
          if child.getBuddy? and child.getBuddy().getId() == @getBuddy().getId()
            remove = true
        if remove then @parent.removeChild(@)
    
      ###*
        Handle the dragging of the buddy tree item
        @param {DwtDragEvent} ev
      ###
      _dragListener: (ev) ->
        if ev.action == DwtDragEvent.SET_DATA
          ev.doIt = false
          ev.srcData = @
    
      ###*
        Initialize the current object.
        @param {number} index
        @param {boolean} realizeDeferred
        @param {boolean} forceNode
        @private
      ###
      _initialize: (index, realizeDeferred, forceNode) ->
        super(index, realizeDeferred, forceNode)
        @_updateVisibility()

#      _setTreeElementStyles: (img, focused) ->
#        if img is "ColumnDownArrow"
#          img = "MoreVertical,color=#989898"
#        super(img, focused)

      ###*
        Apply the filter value for the buddy list.
        Only the matching buddies will be displayed.
        @param {RegExp} regex
        @return {number}
      ###
      applyFilter: (regex) ->
        itemsShown = 0
        try
          result = @getBuddy().filterTest(regex)
          if result
            itemsShown = 1
            @setVisible(true, true, false)
          else
            @setVisible(false, true, false)
          if regex.toString() in ["/(?:)/", "/(?:)/i"]
            @_updateVisibility()
        catch err
          Log.err(err, "BuddyTreeItem.applyFilter")
        itemsShown
    
      ###*
        @return {ZmContact}
      ###
      getContact: () ->
        contactList = AjxDispatcher.run("GetContacts")
        contactList.getContactByEmail(@refBuddy.getId())
    
      ###*
        Create tooltip for the buddy tree item.
        @param {AjxCallback} callback
        @private
      ###
      _createTooltip: (callback) ->
        expanded = AjxTemplate.expand(
          "com_zextras_chat_open.Widgets#BuddyTreeItemTooltip",
          {
            buddy: @getBuddy()
            contact : @getContact()
          }
        )
        callback.run(expanded)
    
    exports.BuddyTreeItem = BuddyTreeItem
    return
)
