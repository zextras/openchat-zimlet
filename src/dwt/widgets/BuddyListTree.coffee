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
    '../../lib/callbacks/Callback',
    '../../lib/callbacks/CallbackManager',
    '../../zimbra/ajax/events/AjxListener',
    '../../zimbra/ajax/dwt/core/Dwt',
    '../../zimbra/ajax/dwt/widgets/DwtTree',
    '../../zimbra/ajax/dwt/widgets/DwtTreeItem',
    '../../client/BuddyList',
    './GroupTreeItem',
    '../../settings/Setting',
    '../IdGenerator',
    '../../zimbra/ajax/dwt/events/DwtUiEvent',
  ],
  (
    require,
    exports,
    LogEngine_1,
    StringUtils_1,
    Callback_1,
    CallbackManager_1,
    AjxListener_1,
    Dwt_1,
    DwtTree_1,
    DwtTreeItem_1,
    BuddyList_1,
    GroupTreeItem_1,
    Setting_1,
    IdGenerator_1,
    DwtUiEvent_1
  ) ->
    "use strict"
    
    AjxListener = AjxListener_1.AjxListener
    Dwt = Dwt_1.Dwt
    DwtTree = DwtTree_1.DwtTree
    DwtTreeItem = DwtTreeItem_1.DwtTreeItem

    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)
    Callback = Callback_1.Callback
    CallbackManager = CallbackManager_1.CallbackManager

    BuddyListController = BuddyList_1.BuddyList
    GroupTreeItem = GroupTreeItem_1.GroupTreeItem
    Setting = Setting_1.Setting
    IdGenerator = IdGenerator_1.IdGenerator
    DwtUiEvent = DwtUiEvent_1.DwtUiEvent

    StringUtils = StringUtils_1.StringUtils

    class BuddyListTree extends DwtTree

      @_KEY_DATA_ID = "DATA_ID"

      @_ID_ADD_BUDDY = "ID_ADD_BUDDY"
      @_ID_NO_ONLINE_BUDDIES = "NO_ONLINE_BUDDIES"
      @_ID_NO_BUDDIES_FOUND = "NO_BUDDIES_FOUND"

      ###*
        @param {DwtComposite} parent
        @param {Client.BuddyList} buddyList
        @constructor
      ###
      constructor: (parent, buddyList, appCtxt, sortFunction, mainWindowPluginManager) ->
        super({
          parent: parent
          className: "DwtTree"
          id: IdGenerator.generateId("ZxChat_BuddyList")
        })
        @_sortPass = 0
        @appCtxt = appCtxt
        @buddyList = buddyList
        @mainWindowPluginManager = mainWindowPluginManager
        @setScrollStyle(Dwt.SCROLL_Y)
        @filterApplied = null
        @addSelectionListener(new AjxListener(@, @onSelection))
        @onAddBuddyCkMgr = new CallbackManager()
        @onBuddyStatusChangeCbkMgr = new CallbackManager()
        @onBuddySelectedCallbacks = new CallbackManager()
        @onDeleteBuddyCallbacks = new CallbackManager()
        @onRemoveBuddyCallbacks = new CallbackManager()
        @onRenameBuddyCallbacks = new CallbackManager()
        @onSendInvitationCallbacks = new CallbackManager()
        @onAcceptInvitationCallbacks = new CallbackManager()
        @onRenameGroupCallbacks = new CallbackManager()
        @onDeleteGroupCallbacks = new CallbackManager()
        @onGroupSelectedCallbacks = new CallbackManager()
        @onBuddyDroppedInGroupCallbacks = new CallbackManager()
        @onContactDroppedInGroupCallbacks = new CallbackManager()
        @onAddFriendSelectionCbkMgr = new CallbackManager()
        @onGroupExpandCollapseCbkMgr = new CallbackManager()
        buddyList.onAddGroup(new Callback(@, @_addGroup))
        buddyList.onRemoveGroup(new Callback(@, @_removeGroup))
        @hideOfflineBuddies = true
        @sortMethod = Setting.BUDDY_SORT_NAME
        @sortFunction = sortFunction
        defaultGroup = buddyList.getDefaultGroup()
        if DwtControl? and DwtControl._dndScrollCallback?
          params = {container:document.getElementById(@getHTMLElId()), threshold:15, amount:5, interval:10, id:@getHTMLElId()}
          @_dndScrollCallback = new AjxCallback(null, DwtControl._dndScrollCallback, [params])
          @_dndScrollId = @getHTMLElId()
        @rootGroup = new GroupTreeItem(@, defaultGroup, @appCtxt, @mainWindowPluginManager)
        @rootGroup.onDeleteBuddy(new Callback(@, @_onDeleteBuddy))
        @rootGroup.onRenameBuddy(new Callback(@, @_onRenameBuddy))
        @rootGroup.onSendInvitation(new Callback(@, @_onSendInvitation))
        @rootGroup.onAcceptInvitation(new Callback(@, @_onAcceptInvitation))
        @rootGroup.onBuddyDroppedInGroup(new Callback(@, @_onBuddyDroppedInGroup))
        @rootGroup.onContactDroppedInGroup(new Callback(@, @_onContactDroppedInGroup))
        defaultGroup.onAddBuddy(new Callback(@, @_onAddBuddy))
        defaultGroup.onRemoveBuddy(new Callback(@, @_onRemoveBuddy))
        @rootGroup.onBuddyStatusChange(new Callback(@, @_onBuddyStatusChange))
        @rootGroup.onGroupExpandCollapse(new Callback(@, @_onGroupExpandCollapse))
        @rootGroup.setSortMethod(@sortMethod, @sortFunction)
        # Objects to help the user to understand his buddy list status.
        @_addBuddyTreeItem = new DwtTreeItem({
          parent: @
    #      imageInfo: 'Info'
          text: StringUtils.getMessage("add_friend")
          imageInfo: "ZxChat_addBuddy"
          id: IdGenerator.generateId("ZxChat_Add_Buddy_Row")
        })
        @_addBuddyTreeItem.setData(
          BuddyListTree._KEY_DATA_ID
          BuddyListTree._ID_ADD_BUDDY
        )
        @_addBuddyTreeItem.setVisible(false)
        @_noOnlineBuddiesTreeItem = new DwtTreeItem({
          parent: @
          text: StringUtils.getMessage("no_buddies_online")
          selectable: false
          id: IdGenerator.generateId("ZxChat_No_Buddies_Online")
        })
        @_noOnlineBuddiesTreeItem.setData(
          BuddyListTree._KEY_DATA_ID
          BuddyListTree._ID_NO_ONLINE_BUDDIES
        )
        @_noOnlineBuddiesTreeItem.setVisible(false)
        @_noBuddiesFound = new DwtTreeItem({
          parent: @
          text: StringUtils.getMessage("no_buddies_found")
          selectable: false
          id: IdGenerator.generateId("ZxChat_No_Buddies_Found")
        })
        @_noBuddiesFound.setData(
          BuddyListTree._KEY_DATA_ID
          BuddyListTree._ID_NO_BUDDIES_FOUND
        )
        @_noBuddiesFound.setVisible(false)
        # Populate the buddy list tree
        @_addGroup(group) for group in buddyList.getGroups() when group.getName() != BuddyListController.DEFAULT_GROUP_NAME
        @_updateFixedTreeItemsVisibility()

      getRootGroup: () ->
        @rootGroup

      ###*
        @private
      ###
      _addGroup: (group) ->
        dwtGroup = new GroupTreeItem(@rootGroup, group, @appCtxt, @mainWindowPluginManager)
        group.onAddBuddy(new Callback(@, @_onAddBuddy))
        group.onRemoveBuddy(new Callback(@, @_onRemoveBuddy))
        dwtGroup.onBuddyStatusChange(new Callback(@rootGroup, @rootGroup._setRootGroupLabel, @buddyList))
        dwtGroup.onBuddyStatusChange(new Callback(@, @_onBuddyStatusChange))
        dwtGroup.onRenameGroupSelected(new Callback(@, @_onRenameGroupSelected))
        dwtGroup.onDeleteGroupSelected(new Callback(@, @_onDeleteGroupSelected))
        dwtGroup.onDeleteBuddy(new Callback(@, @_onDeleteBuddy))
        dwtGroup.onRenameBuddy(new Callback(@, @_onRenameBuddy))
        dwtGroup.onSendInvitation(new Callback(@, @_onSendInvitation))
        dwtGroup.onAcceptInvitation(new Callback(@, @_onAcceptInvitation))
        dwtGroup.onBuddyDroppedInGroup(new Callback(@, @_onBuddyDroppedInGroup))
        dwtGroup.onContactDroppedInGroup(new Callback(@, @_onContactDroppedInGroup))
        dwtGroup.onGroupExpandCollapse(new Callback(@, @_onGroupExpandCollapse))
        dwtGroup.setSortMethod(@sortMethod, @sortFunction)
        dwtGroup.showHideOfflineBuddies(@hideOfflineBuddies)
        @rootGroup.sort()
        @_updateFixedTreeItemsVisibility()

      ###*
        @private
      ###
      _removeGroup: (group) ->
        Log.debug(group.getName(), "Remove this group")
        group.deleteGroup()

      ###*
        Handle an event performed on the Buddy list
        @param {DwtSelectionEvent} ev Event performed on the tree
      ###
      onSelection: (ev) ->
        if not ev? or not ev.dwtObj? then return

        itemId = ev.dwtObj.getData(BuddyListTree._KEY_DATA_ID)

        if ev.detail? and ev.detail == DwtTree.ITEM_ACTIONED
          if ev.dwtObj.onAction? then ev.dwtObj.onAction(ev, @)
        else if ev.detail? and ev.detail == DwtTree.ITEM_SELECTED
          targetElement = DwtUiEvent.getTargetWithProp(ev, "id")
          if ev.dwtObj._extraCell and targetElement and (ev.dwtObj._extraCell.id is targetElement.id) # Context menu
            ev.dwtObj.onAction(ev, @)
          else
            if ev.dwtObj.onSelection? then ev.dwtObj.onSelection(ev, @)
            if ev.dwtObj.getBuddy? # fruit-eating wolf says it is a BuddyTreeItem
              @onBuddySelectedCallbacks.run(ev, @)
            else if ev.dwtObj.getGroup? # fruit-eating wolf says it is a GroupTreeItem
              @onGroupSelectedCallbacks.run(ev, @)
            else if itemId?
              if itemId is BuddyList._ID_ADD_BUDDY
                @onAddFriendSelectionCbkMgr.run()

      ###*
        Show or hide the buddies offline
        @param {boolean} hide
      ###
      showHideOfflineBuddies: (hide) ->
        @hideOfflineBuddies = hide
        for groupTreeItem in @getChildren() when groupTreeItem.showHideOfflineBuddies?
          groupTreeItem.showHideOfflineBuddies(hide)

      ###*
        @param {Callback} callback
      ###
      onBuddySelected: (callback) ->
        @onBuddySelectedCallbacks.addCallback(callback)

      ###*
        @param {Callback} callback
      ###
      onAddBuddy: (callback) ->
        @onAddBuddyCkMgr.addCallback(callback)

      ###*
        @param {Buddy} buddy
      ###
      _onAddBuddy: (buddy) ->
        @_updateFixedTreeItemsVisibility()
        @onAddBuddyCkMgr.run(buddy)

      ###*
        @param {Callback} callback
      ###
      onBuddyStatusChange: (callback) ->
        @onBuddyStatusChangeCbkMgr.addCallback(callback)

      ###*
        @param {Buddy} buddy
        @param {BuddyStatus} status
      ###
      _onBuddyStatusChange: (buddy, status) ->
        @_updateFixedTreeItemsVisibility()
        @_applyFilterOnStatusChange()
        @onBuddyStatusChangeCbkMgr.run(buddy, status)

      ###*
         @param {Callback} callback
       ###
      onRemoveBuddy: (callback) ->
        @onRemoveBuddyCallbacks.addCallback(callback)

      ###*
        @param {Buddy} buddy
        @private
      ###
      _onRemoveBuddy: (buddy) ->
        @_updateFixedTreeItemsVisibility()
        @onRemoveBuddyCallbacks.run(buddy)

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
        Set a callback which will be invoked when a rename of a group is requested
        @param {Callback} callback
      ###
      onRenameGroupSelected: (callback) ->
        @onRenameGroupCallbacks.addCallback(callback)

      ###*
        Trigger the callbacks set for the rename group event
        @private
      ###
      _onRenameGroupSelected: (group) ->
        @onRenameGroupCallbacks.run(group)

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
      _onDeleteGroupSelected: (group) ->
        @onDeleteGroupCallbacks.run(group)

      ###*
        Set a callback which will be invoked when a buddy is dropped in a group
        @param {Callback} callback
      ###
      onBuddyDroppedInGroup: (callback) ->
        @onBuddyDroppedInGroupCallbacks.addCallback(callback)

      ###*
        Trigger the callbacks when a buddy is dropped on a group
        @private
      ###
      _onBuddyDroppedInGroup: (buddy, group) ->
        @onBuddyDroppedInGroupCallbacks.run(buddy, group)

      ###*
        Set a callback which will be invoked when a Zimbra contact is dropped in the group
        @param {Callback} callback
      ###
      onContactDroppedInGroup: (callback) ->
        @onContactDroppedInGroupCallbacks.addCallback(callback)

      ###*
        Trigger the callbacks when a Zimbra contact is dropped on a group
        @private
      ###
      _onContactDroppedInGroup: (contact, group) ->
        @onContactDroppedInGroupCallbacks.run(contact, group)

      ###*
        Set a callback to be invoked when a group is expanded or collapsed.
        @param {Callback} callback
      ###
      onGroupExpandCollapse: (callback) ->
        @onGroupExpandCollapseCbkMgr.addCallback(callback)

      ###*
        @param {GroupTreeItem} item
        @param {boolean} expand
        @param {boolean} save
        @private
      ###
      _onGroupExpandCollapse: (item, expand, save) ->
        @onGroupExpandCollapseCbkMgr.run(item, expand, save)

      ###*
        Get information about the graphic representation of the groups
        These information will be stored in the user properties and will be loaded
        at the zimlet startup.
        @return {{}[]}
      ###
      getGroupsData: () ->
        data = []
        for dwtGroup in @rootGroup.getChildren()
          if dwtGroup.getGroup? # Exclude everything which is not a GroupTreeItem (according to javascript)
            group = dwtGroup.getGroup()
            data.push({
              name: group.getName()
              expanded: dwtGroup.getExpanded()
            })
        data

      ###*
        Set the group visibility/expansion according to the group data set
        @param {{}[]}
      ###
      setGroupsData: (data) ->
        for grpData in data
          @_recursiveSetGroupsData(@getChildren(), grpData)
        null

      ###*
        Recursive function! This will apply the group data navigating the children's children
        @param {[]} children
        @param {{}} groupData
        @private
      ###
      _recursiveSetGroupsData: (children = [], groupData) ->
        expanded = groupData.expanded
        name = groupData.name
        for groupItem in children when groupItem.getGroup?
          if groupItem.getGroup().getName() is name
            groupItem._originalExpanded = expanded
            groupItem.setExpanded(expanded, true, false)
            return
          @_recursiveSetGroupsData(groupItem.getChildren(), groupData)

      ###*
        Apply the filter value for the buddy list.
        Only the matching buddies will be displayed.
        @param {string} filterValue
      ###
      applyFilter: (filterValue) ->
        try
          if filterValue isnt ""
            @filterApplied = filterValue
          else
            @filterApplied = null
          regex = new RegExp(filterValue, "i")
        catch err
          filterValue = ""
          @filterApplied = null
          regex = /\w+/i
        shown = @rootGroup.applyFilter(regex)
        if shown > 0 or filterValue is ""
          @_noBuddiesFound.setVisible(false)
        else
          @_noBuddiesFound.setVisible(true)
        @_updateFixedTreeItemsVisibility()

      ###*
        @param {Callback} callback
      ###
      onAddFriendSelection: (callback) ->
        @onAddFriendSelectionCbkMgr.addCallback(callback)

      ###*
        Update the visibility of the tree item like:
        - Add buddy
        - No online buddies
        @private
      ###
      _updateFixedTreeItemsVisibility: () ->
        stats = @buddyList.getStatistics()
        online = stats.getOnlineBuddiesCount()
        total = stats.getTotalBuddiesCount()
        if total <= 0
          @_addBuddyTreeItem.setVisible(true)
          @_noOnlineBuddiesTreeItem.setVisible(false)
        else
          @_addBuddyTreeItem.setVisible(false)
          @_noOnlineBuddiesTreeItem.setVisible(online <= 0)

      ###*
        Get global statistics.
        @return {GroupStats}
      ###
      getStatistics: () -> @buddyList.getStatistics()

      ###*
        Get the sort method of the buddy list.
        @return {string}
      ###
      getSortMethod: () ->
        @sortMethod

      ###*
        Set the sort method of the buddy list.
        @param {string} method
      ###
      setSortMethod: (method, sortFunction) ->
        @sortMethod = method
        @sortFunction = sortFunction
        for groupTreeItem in @getChildren() when groupTreeItem.setSortMethod?
          groupTreeItem.setSortMethod(@sortMethod, @sortFunction)

      ###*
        Apply the filter when a user change its status (and if the filter is set)
        @private
      ###
      _applyFilterOnStatusChange: () ->
        if @filterApplied? then @applyFilter(@filterApplied)

      ###*
        Get a group by name
        @param {string} id
        @return {GroupTreeItem|null}
      ###
      getGroup: (id) ->
        for dwtGroup in @rootGroup.getChildren()
          if dwtGroup.getGroup? # Exclude everything which is not a GroupTreeItem (according to javascript)
            group = dwtGroup.getGroup()
            if group.getId() is id
              return dwtGroup
        null

      ###*

      ###
      setExpanded: (expand, expandChildren) ->
        @rootGroup._expand(expand, expandChildren)

      triggerSortGroups: () ->
        @buddyList.triggerSortGroups()

    exports.BuddyListTree = BuddyListTree
    return
)
