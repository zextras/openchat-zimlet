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
    '../../lib/StringUtils'
    '../../lib/ArrayUtils'
    '../../lib/callbacks/CallbackManager'
    '../../lib/callbacks/Callback'
    '../../zimbra/ajax/events/AjxListener'
    '../../zimbra/ajax/dwt/dnd/DwtDropEvent'
    '../../zimbra/ajax/dwt/widgets/DwtTreeItem'
    '../../zimbra/zimbraMail/abook/model/ZmContact'
    '../../client/BuddyList'
    './BuddyTreeItem'
    '../dnd/DropTarget'
    './GroupTreeItemActionMenuFactory'
    '../dnd/TransferType'
    '../../settings/Setting'
    '../IdGenerator'
    '../../lib/LearningClipUtils'
  ],
  (
    require,
    exports,
    LogEngine_1,
    StringUtils_1,
    ArrayUtils_1,
    CallbackManager_1
    Callback_1
    AjxListener_1,
    DwtDropEvent_1,
    DwtTreeItem_1,
    ZmContact_1,
    BuddyList_1,
    BuddyTreeItem_1,
    DropTarget_1,
    GroupTreeItemActionMenuFactory_1,
    TransferType_1,
    Setting_1,
    IdGenerator_1,
    LearningClipUtils_1
  ) ->
    "use strict"
    
    AjxListener = AjxListener_1.AjxListener
    DwtDropEvent = DwtDropEvent_1.DwtDropEvent
    DwtTreeItem = DwtTreeItem_1.DwtTreeItem
    ZmContact = ZmContact_1.ZmContact

    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)
    StringUtils = StringUtils_1.StringUtils
    ArrayUtils = ArrayUtils_1.ArrayUtils
    CallbackManager = CallbackManager_1.CallbackManager
    Callback = Callback_1.Callback

    BuddyList = BuddyList_1.BuddyList
    BuddyTreeItem = BuddyTreeItem_1.BuddyTreeItem
    DropTarget = DropTarget_1.DropTarget
    GroupTreeItemActionMenuFactory = GroupTreeItemActionMenuFactory_1.GroupTreeItemActionMenuFactory
    TransferType = TransferType_1.TransferType
    Setting = Setting_1.Setting
    IdGenerator = IdGenerator_1.IdGenerator
    LearningClipUtils = LearningClipUtils_1.LearningClipUtils

    class GroupTreeItem extends DwtTreeItem

      @MAX_LENGTH = 217

      isGroupTreeItem: true

      constructor: (parent, group, appCtxt, mainWindowPluginManager) ->
        @refGroup = group
        @appCtxt = appCtxt
        @mainWindowPluginManager = mainWindowPluginManager
        isDefault = group.getName() == BuddyList.DEFAULT_GROUP_NAME
        groupParams = {
          parent: parent
          id: IdGenerator.generateId("ZxChat_GroupTreeItem_#{group.getName()}")
          dndScrollCallback: parent._dndScrollCallback
          dndScrollId: parent._dndScrollId
    #      imageInfo: "Group"
        }
        if isDefault
          groupParams.className = 'FirstOverviewHeader overviewHeader'
          groupParams.text = StringUtils.getMessage("online_offline_count", ["0", "0"])
          groupParams.selectable = false
          groupParams.arrowDisabled = true
        else
          treeText = group.getName()
          if group.getName().length > 22
            treeText = LearningClipUtils.clip(group.getName(), GroupTreeItem.MAX_LENGTH, "DwtTreeItem-Text")
          groupParams.text = treeText
          groupParams.selectable = true
        super(groupParams)
        @showExpansionIcon(!isDefault)
        @_originalExpanded = false
        @setVisible(true)
        @hideOfflineBuddies = true
        @_sortMethod = Setting.BUDDY_SORT_NAME
        if typeof ZmContact != 'undefined'
          dropTarget = new DropTarget([
            new TransferType("BuddyTreeItem", BuddyTreeItem)
            new TransferType("ZmContact", ZmContact)
          ])
        else
          dropTarget = new DropTarget([
            new TransferType("BuddyTreeItem", BuddyTreeItem)
          ])
        dropTarget.addDropListener(new AjxListener(@, @_dropListener))
        @setDropTarget(dropTarget)
        group.onAddBuddy(new Callback(@, @_addBuddy))
        group.onRemoveBuddy(new Callback(@, @_removeBuddy))
        group.onDelete(new Callback(@, @_onDelete))
        group.onNameChange(new Callback(@, @_onNameChange))
        group.onSort(new Callback(@, @sort))
        @_addBuddy(buddy, false) for buddy in @refGroup.getBuddies()
        if isDefault
          try # Fix for ZXCHAT-302
            @_originalExpanded = true
            @_expand(true, null, true)
          catch ignored
        @onDeleteBuddyCallbacks = new CallbackManager()
        @onRenameBuddyCallbacks = new CallbackManager()
        @onRenameGroupCallbacks = new CallbackManager()
        @onDeleteGroupCallbacks = new CallbackManager()
        @onSendInvitationCallbacks = new CallbackManager()
        @onAcceptInvitationCallbacks = new CallbackManager()
        @onBuddyDroppedInGroupCallbacks = new CallbackManager()
        @onContactDroppedInGroupCallbacks = new CallbackManager()
        @onBuddyStatusChangeCallbacks = new CallbackManager()
        @onGroupExpandCollapseCbkMgr = new CallbackManager()
        if parent instanceof GroupTreeItem and parent.getChildren().length > 0
          parent._expand(parent._originalExpanded, null, null, false)

      ###*
        Hide the offline buddies into the group
        @param {boolean} hide
      ###
      showHideOfflineBuddies: (hide) ->
        @hideOfflineBuddies = hide
        for treeItem in @getChildren()
          if treeItem.getBuddy? # Is a buddy tree item, hide or show it
            treeItem.showHideOffline(hide)
          if treeItem.getGroup? # Is a group tree item, propagate the information
            treeItem.showHideOfflineBuddies(hide)

      ###*
        @param {boolean} expand
        @param {DwtMouseEvent} ev
        @param {boolean} skipNotify
        @param {boolean=true} notify
      ###
      _expand: (expand, ev, skipNotify, notify = true) ->
        if not @_childDiv? then @_realizeDeferredChildren()
        if not @_childDiv? then return
        super(expand, ev, skipNotify)
    #    @_expanded = expand
        if notify
          @_originalExpanded = expand
        if @onGroupExpandCollapseCbkMgr?
          # Fix for ZXCHAT-268
          @onGroupExpandCollapseCbkMgr.run(@, expand, notify)

      ###*
        Add a buddy to the group tree item
        @param {Buddy} buddy
        @param {boolean} [sort=true]
        @private
      ###
      _addBuddy: (buddy, sort = true) ->
        buddyItem = new BuddyTreeItem(@, buddy, @appCtxt, @mainWindowPluginManager)
        buddyItem.onDeleteBuddy(new Callback(@, @_onDeleteBuddy))
        buddyItem.onRenameBuddy(new Callback(@, @_onRenameBuddy))
        buddyItem.onSendInvitation(new Callback(@, @_onSendInvitation))
        buddyItem.onAcceptInvitation(new Callback(@, @_onAcceptInvitation))
        buddy.onStatusChange(new Callback(@, @_onBuddyStatusChange))
        buddy.onStatusChange(new Callback(@, @promiseSort))
        buddy.onNicknameChange(new Callback(@, @sort))
        @_updateCounter()
        for child in @getChildren()
          if child instanceof BuddyTreeItem
            @_expand(@_originalExpanded, null, null, false)
            break
        buddyItem.showHideOffline(@hideOfflineBuddies)
        if sort
          @sort()
        return

      ###*
        Remove a buddy as child of this buddy tree item
        @param {Buddy} buddy
        @private
      ###
      _removeBuddy: (buddy) ->
        Log.debug({
          id: buddy.getId()
          name: buddy.getNickname()
        }, "Buddy removed from group")
        for child in @getChildren()
          if child.getBuddy? and child.getBuddy().getId() is buddy.getId()
            @removeChild(child)
          if child.getGroup?
            child._removeBuddy(buddy)
        @_updateCounter()
        true

      ###*
        Update the counter of the group tree item
        @private
      ###
      _updateCounter: () ->
        stats = @getGroup().getStatistics().clone()
        for child in @getChildren() when child instanceof GroupTreeItem
          stats.add(child.getGroup().getStatistics())
        name = "#{@getGroup().getName()} #{stats.getOnlineBuddiesCount()}/#{stats.getTotalBuddiesCount()}"
        if @getGroup().getName() == BuddyList.DEFAULT_GROUP_NAME
          name = StringUtils.getMessage("online_offline_count", [stats.getOnlineBuddiesCount(), stats.getOfflineBuddiesCount()])
        if name.length > 23
          name = LearningClipUtils.clip(name, GroupTreeItem.MAX_LENGTH, "DwtTreeItem-Text")
        @setText(name)
        if @parent instanceof GroupTreeItem
          @parent._updateCounter()

      ###*
        Change the name of the group
        @param {string} newName
        @private
      ###
      _onNameChange: (newName, grp) ->
        @_updateCounter()

      ###*
        Get the group associated to the tree item
        @return {Group}
      ###
      getGroup: () ->
        @refGroup

      ###*
        @param {Callback} callback
      ###
      onDeleteBuddy: (callback) ->
        @onDeleteBuddyCallbacks.addCallback(callback)

      ###*
        @param {Buddy} buddy
        @private
      ###
      _onDeleteBuddy: (buddy) ->
        @_updateCounter()
        @onDeleteBuddyCallbacks.run(buddy)

      ###*
        @param {Callback} callback
      ###
      onRenameBuddy: (callback) ->
        @onRenameBuddyCallbacks.addCallback(callback)

      ###*
        @param {Buddy} buddy
        @private
      ###
      _onRenameBuddy: (buddy) ->
        @onRenameBuddyCallbacks.run(buddy)

      ###*
        @param {Callback} callback
      ###
      onSendInvitation: (callback) ->
        @onSendInvitationCallbacks.addCallback(callback)

      ###*
        @param {Buddy} buddy
        @private
      ###
      _onSendInvitation: (buddy) ->
        @onSendInvitationCallbacks.run(buddy)

      ###*
        @param {Callback} callback
      ###
      onAcceptInvitation: (callback) ->
        @onAcceptInvitationCallbacks.addCallback(callback)

      ###*
        @param {Buddy} buddy
        @private
      ###
      _onAcceptInvitation: (buddy) ->
        @onAcceptInvitationCallbacks.run(buddy)

      ###*
        Handle the action command, usually triggered by the right-click
        @param {DwtSelectionEvent} ev
      ###
      onAction: (ev) ->
        if @getGroup().getName() == BuddyList.DEFAULT_GROUP_NAME then return
        if not @actionMenu?
          @actionMenu = GroupTreeItemActionMenuFactory.createMenu(@, @mainWindowPluginManager)
        @actionMenu.popup(0, ev.docX, ev.docY, false)

      ###*
        Set a callback which will be invoked when a rename of a group is requested
        @param {Callback} callback
      ###
      onRenameGroupSelected: (callback) ->
        @onRenameGroupCallbacks.addCallback(callback)

      ###*
        Trigger the callbacks set for the rename group event
        @private
      ###
      _onRenameGroupSelected: () ->
        @onRenameGroupCallbacks.run(@getGroup())

      ###*
        Set a callback which will be invoked when a delete of a group is requested
        @param {Callback} callback
      ###
      onDeleteGroupSelected: (callback) ->
        @onDeleteGroupCallbacks.addCallback(callback)

      ###*
        Trigger the callbacks set for the remove group event
        @private
      ###
      _onDeleteGroupSelected: () ->
        @onDeleteGroupCallbacks.run(@getGroup())

      ###*
        Set a callback which will be invoked when a buddy is dropped in the group
        @param {Callback} callback
      ###
      onBuddyDroppedInGroup: (callback) ->
        @onBuddyDroppedInGroupCallbacks.addCallback(callback)

      ###*
        Set a callback which will be invoked when a Zimbra contact is dropped in the group
        @param {Callback} callback
      ###
      onContactDroppedInGroup: (callback) ->
        @onContactDroppedInGroupCallbacks.addCallback(callback)

      ###*
        Set a callback to be invoked when the group is expanded or collapsed.
        @param {Callback} callback
      ###
      onGroupExpandCollapse: (callback) ->
        @onGroupExpandCollapseCbkMgr.addCallback(callback)

      ###*
        Remove the tree item associated to a Group
        @param {Group} group
        @private
      ###
      _onDelete: (group) ->
        @parent.removeChild(@)

      ###*
        Handle the drop of objects into the tree item
        @param {DwtDropEvent} ev
        @private
      ###
      _dropListener: (ev) ->
        if not ev.srcData? then return false
        if ev.action == DwtDropEvent.DRAG_ENTER
          objToCheck = ev.srcData
          # Manage contact data
          if ev.srcData.data?
            if ArrayUtils.isArray(ev.srcData.data)
            # Cool how standard is zimbra, isn't it?
              if  ev.srcData.data.length > 1
                ev.doIt = false
                return true
              else
                objToCheck = ev.srcData.data[0]
            else
              objToCheck = ev.srcData.data
          # Check if the buddy is already in this group
          if ev.srcData? and ev.srcData.getBuddy?
            buddy = @getGroup().getBuddyById(ev.srcData.getBuddy().getId())
            if buddy?
              ev.doIt = false
              return true
          ev.doIt = @getDropTarget().isValidTarget(objToCheck)

        else if ev.action == DwtDropEvent.DRAG_DROP
    #      Log.debug(ev, "Something dropped on group '#{@getGroup().getName()}'")
          # Manage contact data
          if ev.srcData.data?
            if ArrayUtils.isArray(ev.srcData.data) # Manage contact data
              contactInfo = ev.srcData.data[0]
            else
              contactInfo = ev.srcData.data
            @onContactDroppedInGroupCallbacks.run(contactInfo, @getGroup())
          # Manage Buddy tree item
          else if ev.srcData? # Manage Buddy tree item
            buddyItem = ev.srcData
            @onBuddyDroppedInGroupCallbacks.run(buddyItem.getBuddy(), @getGroup())
        true

      ###*
        Manage a buddy status change
        @param {Buddy} buddy
        @param {BuddyStatus} status
        @private
      ###
      _onBuddyStatusChange: (buddy, status) ->
        @_updateCounter()
        @onBuddyStatusChangeCallbacks.run(buddy, status)

      ###*
        Set a callback which will be invoked when a buddy change it status.
        @param {Callback} callback
      ###
      onBuddyStatusChange: (callback) ->
        @onBuddyStatusChangeCallbacks.addCallback(callback)

      ###*
        Update the root group label
        @params {BuddyList} buddyList
        @private
      ###
      _setRootGroupLabel: (buddyList) ->
        online = 0
        offline = 0
        for group in buddyList.getGroups()
          stats = group.getStatistics()
          online += stats.getOnlineBuddiesCount()
          offline += stats.getOfflineBuddiesCount()
        @setText(StringUtils.getMessage("online_offline_count", [online, offline]))

      ###*
        Apply the filter value for the buddy list.
        Only the matching buddies will be displayed.
        @param {RegExp} regex
        @return {number}
      ###
      applyFilter: (regex) ->
        itemsShown = 0
        for treeItem in @getChildren()
          try
            if treeItem.getBuddy? and treeItem.applyFilter?
              # Is a buddy tree item, hide or show it
              itemsShown += treeItem.applyFilter(regex)
            if treeItem.getGroup? and treeItem.applyFilter?
              # Is a group tree item, propagate the information
              itemsShown += treeItem.applyFilter(regex)
          catch err
            Log.err(err, "GroupTreeItem.applyFilter")
        if regex.toString() in ["/(?:)/", "/(?:)/i", "//i", "//"]
          @_expand(@_originalExpanded, null, null, false)
        else
          @_expand(true, null, null, false)
        @setVisible(true)
        itemsShown

      ###*
        Set the sort function
        @param {string} sortMethod
        @param {SortFcns} sortFunction
      ###
      setSortMethod: (sortMethod, sortFunction) ->
        @_sortMethod = sortMethod
        @_sortFunction = sortFunction
        for child in @getChildren()
          if child instanceof GroupTreeItem
            child.setSortMethod(@_sortMethod, @_sortFunction)
        @sort()

      sort: () ->
        if @_sortMethod is Setting.BUDDY_SORT_NAME
          super(@_sortFunction.sortBuddyListByNickname)
        else if @_sortMethod is Setting.BUDDY_SORT_PRESENCE
          super(@_sortFunction.sortBuddyListByNickname)
          super(@_sortFunction.sortBuddyListByStatus)

      ###*
        Sort current group on trigger, discarded when current change doesn't need sort
      ###
      promiseSort: () ->
        @refGroup.promiseSort()

    exports.GroupTreeItem = GroupTreeItem
    return
)