/*
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import {DwtTreeItem} from "../../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {DwtTree} from "../../zimbra/ajax/dwt/widgets/DwtTree";
import {GroupTreeItem} from "./GroupTreeItem";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {BuddyList} from "../../client/BuddyList";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {Callback} from "../../lib/callbacks/Callback";
import {GroupStats} from "../../client/GroupStats";
import {GroupData} from "../../settings/SettingsManager";
import {SortFcns} from "../SortFcns";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {IdGenerator} from "../IdGenerator";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {Group} from "../../client/Group";
import {LogEngine} from "../../lib/log/LogEngine";
import {Setting} from "../../settings/Setting";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";
import {IBuddy} from "../../client/IBuddy";
import {IBuddyStatus} from "../../client/IBuddyStatus";
import {DwtUiEvent} from "../../zimbra/ajax/dwt/events/DwtUiEvent";
import {BuddyTreeItem} from "./BuddyTreeItem";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtChatTreeItem} from "./DwtChatTreeItem";
import {ZmContact} from "../../zimbra/zimbraMail/abook/model/ZmContact";
import {StringUtils} from "../../lib/StringUtils";

export class BuddyListTree extends DwtTree {

  private static KEY_DATA_ID = "DATA_ID";
  private static ID_ADD_BUDDY = "ID_ADD_BUDDY";
  private static ID_NO_ONLINE_BUDDIES = "NO_ONLINE_BUDDIES";
  private static ID_NO_BUDDIES_FOUND = "NO_BUDDIES_FOUND";


  private Log = LogEngine.getLogger(LogEngine.CHAT);
  private mAppCtxt: ZmAppCtxt;
  private mBuddyList: BuddyList;
  private mOnAddBuddyCbkMgr: CallbackManager;
  private mMainWindowPluginManager: ChatPluginManager;
  private mFilterApplied: any;
  private mOnBuddyStatusChangeCbkMgr: CallbackManager;
  private mOnBuddySelectedCbkMgr: CallbackManager;
  private mOnDeleteBuddyCbkMgr: CallbackManager;
  private mOnRemoveBuddyCbkMgr: CallbackManager;
  private mOnRenameBuddyCbkMgr: CallbackManager;
  private mOnSendInvitationCbkMgr: CallbackManager;
  private mOnAcceptInvitationCbkMgr: CallbackManager;
  private mOnRenameGroupCbkMgr: CallbackManager;
  private mOnDeleteGroupCbkMgr: CallbackManager;
  private mOnGroupSelectedCbkMgr: CallbackManager;
  private mOnBuddyDroppedInGroupCbkMgr: CallbackManager;
  private mOnContactDroppedInGroupCbkMgr: CallbackManager;
  private mOnAddFriendSelectionCbkMgr: CallbackManager;
  private mOnGroupExpandCollapseCbkMgr: CallbackManager;
  private mRootGroup: GroupTreeItem;
  private mSortMethod: string;
  private mSortFunction: SortFcns;
  private mHideOfflineBuddies: boolean;
  private mAddBuddyTreeItem: DwtTreeItem;
  private mNoOnlineBuddiesTreeItem: DwtTreeItem;
  private mNoBuddiesFound: DwtTreeItem;

  constructor(
    parent: DwtComposite,
    buddyList: BuddyList,
    appCtxt: ZmAppCtxt,
    sortFunction: SortFcns,
    mainWindowPluginManager: ChatPluginManager
  ) {
    super({
      parent: parent,
      className: "DwtTree",
      id: IdGenerator.generateId("ZxChat_BuddyList")
    });
    this.Log =  LogEngine.getLogger(LogEngine.CHAT);
    // this.sortPass = 0;
    this.mAppCtxt = appCtxt;
    this.mBuddyList = buddyList;
    this.mMainWindowPluginManager = mainWindowPluginManager;
    this.setScrollStyle(Dwt.SCROLL_Y);
    this.mFilterApplied = null;
    this.addSelectionListener(new AjxListener(this, this.onSelection));
    this.mOnAddBuddyCbkMgr = new CallbackManager();
    this.mOnBuddyStatusChangeCbkMgr = new CallbackManager();
    this.mOnBuddySelectedCbkMgr = new CallbackManager();
    this.mOnDeleteBuddyCbkMgr = new CallbackManager();
    this.mOnRemoveBuddyCbkMgr = new CallbackManager();
    this.mOnRenameBuddyCbkMgr = new CallbackManager();
    this.mOnSendInvitationCbkMgr =  new CallbackManager();
    this.mOnAcceptInvitationCbkMgr = new CallbackManager();
    this.mOnRenameGroupCbkMgr = new CallbackManager();
    this.mOnDeleteGroupCbkMgr = new CallbackManager();
    this.mOnGroupSelectedCbkMgr = new CallbackManager();
    this.mOnBuddyDroppedInGroupCbkMgr = new CallbackManager();
    this.mOnContactDroppedInGroupCbkMgr = new CallbackManager();
    this.mOnAddFriendSelectionCbkMgr = new CallbackManager();
    this.mOnGroupExpandCollapseCbkMgr = new CallbackManager();
    buddyList.onAddGroup(new Callback(this, this.addGroup));
    buddyList.onRemoveGroup(new Callback(this, this.removeGroup));
    this.mHideOfflineBuddies = true;
    this.mSortMethod = Setting.BUDDY_SORT_NAME;
    this.mSortFunction = sortFunction;
    let defaultGroup: Group = buddyList.getDefaultGroup();
    if (
      typeof DwtControl !== "undefined" && DwtControl !== null &&
      typeof DwtControl._dndScrollCallback !== "undefined" && DwtControl._dndScrollCallback !== null
    ) {
      let params = {
        container: document.getElementById(this.getHTMLElId()),
        threshold: 15,
        amount: 5,
        interval: 10,
        id: this.getHTMLElId()
      };
      this._dndScrollCallback = <() => void> AjxCallback.simpleClosure(DwtControl._dndScrollCallback, null, [params]);
      this._dndScrollId = this.getHTMLElId();
    }
    this.mRootGroup = new GroupTreeItem(this, defaultGroup, this.mAppCtxt, this.mMainWindowPluginManager);
    this.mRootGroup.onDeleteBuddy(new Callback(this, this.buddyDeleted));
    this.mRootGroup.onRenameBuddy(new Callback(this, this.buddyRenamed));
    this.mRootGroup.onSendInvitation(new Callback(this, this.invitationSent));
    this.mRootGroup.onAcceptInvitation(new Callback(this, this.invitationAccepted));
    this.mRootGroup.onBuddyDroppedInGroup(new Callback(this, this.buddyDroppedInGroup));
    this.mRootGroup.onContactDroppedInGroup(new Callback(this, this.contactDroppedInGroup));
    defaultGroup.onAddBuddy(new Callback(this, this.buddyAdded));
    defaultGroup.onRemoveBuddy(new Callback(this, this.buddyRemoved));
    this.mRootGroup.onBuddyStatusChange(new Callback(this, this.buddyStatusChanged));
    this.mRootGroup.onGroupExpandCollapse(new Callback(this, this.groupExpandedCollapsed));
    this.mRootGroup.setSortMethod(this.mSortMethod, this.mSortFunction);
    this.mAddBuddyTreeItem = new DwtTreeItem({
      parent: this,
      text: StringUtils.getMessage("add_friend"),
      imageInfo: "ZxChat_addBuddy",
      id: IdGenerator.generateId("ZxChat_Add_Buddy_Row")
    });
    this.mAddBuddyTreeItem.setData(
      BuddyListTree.KEY_DATA_ID,
      BuddyListTree.ID_ADD_BUDDY
    );
    this.mAddBuddyTreeItem.setVisible(false);
    this.mNoOnlineBuddiesTreeItem = new DwtTreeItem({
      parent: this,
      text: StringUtils.getMessage("no_buddies_online"),
      selectable: false,
      id: IdGenerator.generateId("ZxChat_No_Buddies_Online")
    });
    this.mNoOnlineBuddiesTreeItem.setData(
      BuddyListTree.KEY_DATA_ID,
      BuddyListTree.ID_NO_ONLINE_BUDDIES
    );
    this.mNoOnlineBuddiesTreeItem.setVisible(false);
    this.mNoBuddiesFound = new DwtTreeItem({
      parent: this,
        text: StringUtils.getMessage("no_buddies_found"),
      selectable: false,
      id: IdGenerator.generateId("ZxChat_No_Buddies_Found")
    });
    this.mNoBuddiesFound.setData(
      BuddyListTree.KEY_DATA_ID,
      BuddyListTree.ID_NO_BUDDIES_FOUND
    );
    this.mNoBuddiesFound.setVisible(false);
    for (let group of buddyList.getGroups()) {
      if (group.getName() !== BuddyList.DEFAULT_GROUP_NAME) {
        this.addGroup(group);
      }
    }
    this.updateFixedTreeItemsVisibility();
  }

  // Awful workaround about _dndScrollCallback definition:
  //   in DwtControl refers to static function and method
  public _dndScrollCallback(): void {}

  public getRootGroup(): GroupTreeItem {
    return this.mRootGroup;
  }

  private addGroup(group: Group): void {
    let dwtGroup: GroupTreeItem = new GroupTreeItem(this.mRootGroup, group, this.mAppCtxt, this.mMainWindowPluginManager);
    group.onAddBuddy(new Callback(this, this.buddyAdded));
    group.onRemoveBuddy(new Callback(this, this.buddyRemoved));
    dwtGroup.onBuddyStatusChange(new Callback(this.mRootGroup, this.mRootGroup.setRootGroupLabel, this.mBuddyList));
    dwtGroup.onBuddyStatusChange(new Callback(this, this.buddyStatusChanged));
    dwtGroup.onRenameGroupSelected(new Callback(this, this.renameGroupSelected));
    dwtGroup.onDeleteGroupSelected(new Callback(this, this.deleteGroupSelected));
    dwtGroup.onDeleteBuddy(new Callback(this, this.buddyDeleted));
    dwtGroup.onRenameBuddy(new Callback(this, this.buddyRenamed));
    dwtGroup.onSendInvitation(new Callback(this, this.invitationSent));
    dwtGroup.onAcceptInvitation(new Callback(this, this.invitationAccepted));
    dwtGroup.onBuddyDroppedInGroup(new Callback(this, this.buddyDroppedInGroup));
    dwtGroup.onContactDroppedInGroup(new Callback(this, this.contactDroppedInGroup));
    dwtGroup.onGroupExpandCollapse(new Callback(this, this.groupExpandedCollapsed));
    dwtGroup.setSortMethod(this.mSortMethod, this.mSortFunction);
    dwtGroup.showHideOfflineBuddies(this.mHideOfflineBuddies);
    this.mRootGroup.sort();
    this.updateFixedTreeItemsVisibility();
  }

  private removeGroup(group: Group): void {
    this.Log.debug(group.getName(), "Remove this group");
    group.deleteGroup();
  }

  public onSelection(ev: DwtSelectionEvent & Event): void {
    if (
      typeof ev === "undefined" || ev === null ||
      typeof ev.dwtObj === "undefined" || ev.dwtObj === null
    ) {
      return;
    }

    let itemId: string = ev.dwtObj.getData(BuddyListTree.KEY_DATA_ID);

    if (typeof ev.detail !== "undefined" && ev.detail === DwtTree.ITEM_ACTIONED) {
      if (typeof (<DwtControl & DwtChatTreeItem>ev.dwtObj).onAction !== "undefined" && (<DwtControl & DwtChatTreeItem>ev.dwtObj).onAction !== null) {
        (<DwtControl & DwtChatTreeItem>ev.dwtObj).onAction(ev);
      }
    }
    else if (typeof ev.detail !== "undefined" && ev.detail === DwtTree.ITEM_SELECTED) {
      let targetElement: HTMLElement = DwtUiEvent.getTargetWithProp(ev, "id");
      if ((<DwtTreeItem>ev.dwtObj)._extraCell && targetElement && ((<DwtTreeItem>ev.dwtObj)._extraCell.id === targetElement.id)) {
        (<DwtControl & DwtChatTreeItem>ev.dwtObj).onAction(ev);
      }
      else {
        if (
          typeof (<ExtendedDwtControl>ev.dwtObj).onSelection !== "undefined" &&
          (<ExtendedDwtControl>ev.dwtObj).onSelection !== null
        ) {
          (<ExtendedDwtControl>ev.dwtObj).onSelection(ev, this);
        }
        if (typeof (<BuddyTreeItem>ev.dwtObj).isBuddyTreeItem !== "undefined" && (<BuddyTreeItem>ev.dwtObj).isBuddyTreeItem()) {
          this.mOnBuddySelectedCbkMgr.run(ev, this);
        }
        else if (typeof (<GroupTreeItem>ev.dwtObj).isGroupTreeItem !== "undefined" && (<GroupTreeItem>ev.dwtObj).isGroupTreeItem()) {
          this.mOnGroupSelectedCbkMgr.run(ev, this);
        }
        else if (typeof itemId !== "undefined" && itemId === BuddyListTree.ID_ADD_BUDDY) {
          this.mOnAddFriendSelectionCbkMgr.run();
        }

      }
    }
  }

  public showHideOfflineBuddies(hide: boolean): void {
    this.mHideOfflineBuddies = hide;
    for (let treeItem of this.getChildren()) {
      if (typeof (<GroupTreeItem>treeItem).isGroupTreeItem !== "undefined" && (<GroupTreeItem>treeItem).isGroupTreeItem()) {
        (<GroupTreeItem>treeItem).showHideOfflineBuddies(hide);
      }
    }
  }

  public onBuddySelected(callback: Callback): void {
    this.mOnBuddySelectedCbkMgr.addCallback(callback);
  }

  public onAddBuddy(callback: Callback): void {
    this.mOnAddBuddyCbkMgr.run(callback);
  }

  private buddyAdded(buddy: IBuddy): void {
    this.updateFixedTreeItemsVisibility();
    this.mOnAddBuddyCbkMgr.run(buddy);
  }

  public onBuddyStatusChange(callback: Callback): void {
    this.mOnBuddyStatusChangeCbkMgr.addCallback(callback);
  }

  private buddyStatusChanged(buddy: IBuddy, status: IBuddyStatus): void {
    this.updateFixedTreeItemsVisibility();
    this.applyFilterOnStatusChange();
    this.mOnBuddyStatusChangeCbkMgr.run(buddy, status);
  }

  public onRemoveBuddy(callback: Callback): void {
    this.mOnRemoveBuddyCbkMgr.addCallback(callback);
  }

  private buddyRemoved(buddy: IBuddy): void {
    this.updateFixedTreeItemsVisibility();
    this.mOnRemoveBuddyCbkMgr.run(buddy);
  }

  public onDeleteBuddy(callback: Callback): void {
    this.mOnDeleteBuddyCbkMgr.addCallback(callback);
  }

  private buddyDeleted(buddy: IBuddy): void {
    this.mOnDeleteBuddyCbkMgr.run(buddy);
  }

  public onRenameBuddy(callback: Callback): void {
    this.mOnRenameBuddyCbkMgr.addCallback(callback);
  }

  private buddyRenamed(buddy: IBuddy): void {
    this.mOnRenameBuddyCbkMgr.run(buddy);
  }

  public onSendInvitation(callback: Callback): void {
    this.mOnSendInvitationCbkMgr.addCallback(callback);
  }

  private invitationSent(buddy: IBuddy): void {
    this.mOnSendInvitationCbkMgr.run(buddy);
  }

  public onAcceptInvitation(callback: Callback): void {
    this.mOnAcceptInvitationCbkMgr.addCallback(callback);
  }

  private invitationAccepted(buddy: IBuddy): void {
    this.mOnAcceptInvitationCbkMgr.run(buddy);
  }

  public onRenameGroupSelected(callback: Callback): void {
    this.mOnRenameGroupCbkMgr.addCallback(callback);
  }

  private renameGroupSelected(group: Group): void {
    this.mOnRenameGroupCbkMgr.run(group);
  }

  public onDeleteGroupSelected(callback: Callback): void {
    this.mOnDeleteGroupCbkMgr.addCallback(callback);
  }

  private deleteGroupSelected(group: Group): void {
    this.mOnDeleteGroupCbkMgr.run(group);
  }

  public onBuddyDroppedInGroup(callback: Callback): void {
    this.mOnBuddyDroppedInGroupCbkMgr.addCallback(callback);
  }

  public buddyDroppedInGroup(buddy: Callback, group: Group): void {
    this.mOnBuddyDroppedInGroupCbkMgr.run(buddy, group);
  }

  public onContactDroppedInGroup(callback: Callback): void {
    this.mOnContactDroppedInGroupCbkMgr.addCallback(callback);
  }

  public contactDroppedInGroup(contact: ZmContact, group: Group): void {
    this.mOnContactDroppedInGroupCbkMgr.run(contact, group);
  }

  public onGroupExpandCollapse(callback: Callback): void {
    this.mOnGroupExpandCollapseCbkMgr.addCallback(callback);
  }

  public groupExpandedCollapsed(item: GroupTreeItem, expand: boolean, save: boolean): void {
    this.mOnGroupExpandCollapseCbkMgr.run(item, expand, save);
  }

  public getGroupsData(): GroupData[] {
    let data: GroupData[] = [];
    for (let dwtGroup of this.mRootGroup.getChildren()) {
      if (dwtGroup.isGroupTreeItem()) {
        let group: Group = (<GroupTreeItem>dwtGroup).getGroup();
        data.push({
          name: group.getName(),
          expanded: (<GroupTreeItem>dwtGroup).getExpanded()
        });
      }
    }
    return data;
  }

  public setGroupsData(data: GroupData[]): void {
    for (let groupData of data) {
      this.recursiveSetGroupData(this.getChildren(), groupData);
    }
  }

  private recursiveSetGroupData(children: DwtComposite[] = [], groupData: GroupData): void {
    for (let groupItem of children) {
      if (
        typeof (<GroupTreeItem>groupItem).isGroupTreeItem !== "undefined" && (<GroupTreeItem>groupItem).isGroupTreeItem()
      ) {
        if ((<GroupTreeItem>groupItem).getGroup().getName() === groupData.name) {
          (<GroupTreeItem>groupItem).setOriginalExpanded(groupData.expanded);
          (<GroupTreeItem>groupItem).setExpanded(groupData.expanded, true, false);
        }
        this.recursiveSetGroupData(groupItem.getChildren(), groupData);
      }
    }
  }

  public applyFilter(filterValue: string): void {
    let regex: RegExp;
    try {
      if (filterValue !== "") {
        this.mFilterApplied = filterValue;
      }
      else {
        this.mFilterApplied = null;
      }
      regex = new RegExp(filterValue, "i");
    }
    catch (err) {
      filterValue = "";
      this.mFilterApplied = null;
      regex = /\w+/i;
    }
    if (this.mRootGroup.applyFilter(regex) || filterValue === "") {
      this.mNoBuddiesFound.setVisible(false);
    }
    else {
      this.mNoBuddiesFound.setVisible(true);
    }
    this.updateFixedTreeItemsVisibility();
  }

  public onAddFriendSelection(callback: Callback): void {
    this.mOnAddFriendSelectionCbkMgr.addCallback(callback);
  }

  private updateFixedTreeItemsVisibility(): void {
    let stats = this.mBuddyList.getStatistics(),
      online = stats.getOnlineBuddiesCount(),
      total = stats.getTotalBuddiesCount();
    if (total <= 0) {
      this.mAddBuddyTreeItem.setVisible(true);
      this.mNoOnlineBuddiesTreeItem.setVisible(false);
    }
    else {
      this.mAddBuddyTreeItem.setVisible(false);
      this.mNoOnlineBuddiesTreeItem.setVisible(online <= 0);
    }
  }

  public getStatistics(): GroupStats {
    return this.mBuddyList.getStatistics();
  }

  public setSortMethod(method: string, sortFunction: SortFcns): void {
    this.mSortMethod = method;
    this.mSortFunction = sortFunction;
    for (let child of this.getChildren()) {
      if (typeof (<GroupTreeItem>child).isGroupTreeItem !== "undefined" && (<GroupTreeItem>child).isGroupTreeItem()) {
        (<GroupTreeItem>child).setSortMethod(this.mSortMethod, this.mSortFunction);
      }
    }
  }

  private applyFilterOnStatusChange() {
    if (typeof this.mFilterApplied !== "undefined" && this.mFilterApplied !== null) {
      this.applyFilter(this.mFilterApplied);
    }
  }

  public getGroup(groupName: string): GroupTreeItem {
    for (let dwtGroup of this.mRootGroup.getChildren()) {
      if (
        typeof (<GroupTreeItem>dwtGroup).isGroupTreeItem !== "undefined" && (<GroupTreeItem>dwtGroup).isGroupTreeItem() &&
        (<GroupTreeItem>dwtGroup).getGroup().getId() === groupName
      ) {
        return (<GroupTreeItem>dwtGroup);
      }
    }
    return null;
  }

  public setExpanded(expand: boolean, expandChildren: boolean): void {
    // was this.mRootGroup._expand(expand, expandChildren);
    this.mRootGroup.setExpanded(expand, expandChildren);
  }

  public triggerSortGroups(): void {
    this.mBuddyList.triggerSortGroups();
  }
}

declare class ExtendedDwtControl extends DwtControl {
  onSelection: (ev: DwtEvent, dwtObj: DwtControl) => void;
}
