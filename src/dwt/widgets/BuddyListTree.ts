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

import {BuddyList} from "../../client/BuddyList";
import {Group} from "../../client/Group";
import {GroupStats} from "../../client/GroupStats";
import {IBuddy} from "../../client/IBuddy";
import {IBuddyStatus} from "../../client/IBuddyStatus";
import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {LogEngine} from "../../lib/log/LogEngine";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {StringUtils} from "../../lib/StringUtils";
import {Setting} from "../../settings/Setting";
import {GroupData} from "../../settings/SettingsManager";
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtUiEvent} from "../../zimbra/ajax/dwt/events/DwtUiEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtTree} from "../../zimbra/ajax/dwt/widgets/DwtTree";
import {DwtTreeItem} from "../../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmContact} from "../../zimbra/zimbraMail/abook/model/ZmContact";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {IdGenerator} from "../IdGenerator";
import {SortFcns} from "../SortFcns";
import {BuddyTreeItem} from "./BuddyTreeItem";
import {IDwtChatTreeItem} from "./DwtChatTreeItem";
import {GroupTreeItem} from "./GroupTreeItem";

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
    mainWindowPluginManager: ChatPluginManager,
  ) {
    super({
      className: "DwtTree",
      id: IdGenerator.generateId("ZxChat_BuddyList"),
      parent: parent,
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
    const defaultGroup: Group = buddyList.getDefaultGroup();
    if (
      typeof DwtControl !== "undefined" && DwtControl !== null &&
      typeof DwtControl._dndScrollCallback !== "undefined" && DwtControl._dndScrollCallback !== null
    ) {
      const params = {
        amount: 5,
        container: document.getElementById(this.getHTMLElId()),
        id: this.getHTMLElId(),
        interval: 10,
        threshold: 15,
      };
      this._dndScrollCallback = AjxCallback.simpleClosure(DwtControl._dndScrollCallback, null, [params]) as () => void;
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
      id: IdGenerator.generateId("ZxChat_Add_Buddy_Row"),
      imageInfo: "ZxChat_addBuddy",
      parent: this,
      text: StringUtils.getMessage("add_friend"),
    });
    this.mAddBuddyTreeItem.setData(
      BuddyListTree.KEY_DATA_ID,
      BuddyListTree.ID_ADD_BUDDY,
    );
    this.mAddBuddyTreeItem.setVisible(false);
    this.mNoOnlineBuddiesTreeItem = new DwtTreeItem({
      id: IdGenerator.generateId("ZxChat_No_Buddies_Online"),
      parent: this,
      selectable: false,
      text: StringUtils.getMessage("no_buddies_online"),
    });
    this.mNoOnlineBuddiesTreeItem.setData(
      BuddyListTree.KEY_DATA_ID,
      BuddyListTree.ID_NO_ONLINE_BUDDIES,
    );
    this.mNoOnlineBuddiesTreeItem.setVisible(false);
    this.mNoBuddiesFound = new DwtTreeItem({
      id: IdGenerator.generateId("ZxChat_No_Buddies_Found"),
      parent: this,
      selectable: false,
      text: StringUtils.getMessage("no_buddies_found"),
    });
    this.mNoBuddiesFound.setData(
      BuddyListTree.KEY_DATA_ID,
      BuddyListTree.ID_NO_BUDDIES_FOUND,
    );
    this.mNoBuddiesFound.setVisible(false);
    for (const group of buddyList.getGroups()) {
      if (group.getName() !== BuddyList.DEFAULT_GROUP_NAME) {
        this.addGroup(group);
      }
    }
    this.updateFixedTreeItemsVisibility();
  }

  // Awful workaround about _dndScrollCallback definition:
  //   in DwtControl refers to static function and method
  public _dndScrollCallback(): void { return; }

  public getRootGroup(): GroupTreeItem {
    return this.mRootGroup;
  }

  public onSelection(ev: DwtSelectionEvent & Event): void {
    if (
      typeof ev === "undefined" || ev === null ||
      typeof ev.dwtObj === "undefined" || ev.dwtObj === null
    ) {
      return;
    }

    const itemId: string = ev.dwtObj.getData(BuddyListTree.KEY_DATA_ID);

    if (typeof ev.detail !== "undefined" && ev.detail === DwtTree.ITEM_ACTIONED) {
      if (typeof (ev.dwtObj as DwtControl & IDwtChatTreeItem).onAction !== "undefined"
        && (ev.dwtObj as DwtControl & IDwtChatTreeItem).onAction !== null
      ) {
        (ev.dwtObj as DwtControl & IDwtChatTreeItem).onAction(ev);
      }
    } else if (typeof ev.detail !== "undefined" && ev.detail === DwtTree.ITEM_SELECTED) {
      const targetElement: HTMLElement = DwtUiEvent.getTargetWithProp(ev, "id");
      if ((ev.dwtObj as DwtTreeItem)._extraCell && targetElement
        && ((ev.dwtObj as DwtTreeItem)._extraCell.id === targetElement.id)
      ) {
        (ev.dwtObj as DwtControl & IDwtChatTreeItem).onAction(ev);
      } else {
        if (
          typeof (ev.dwtObj as ExtendedDwtControl).onSelection !== "undefined" &&
          (ev.dwtObj as ExtendedDwtControl).onSelection !== null
        ) {
          (ev.dwtObj as ExtendedDwtControl).onSelection(ev, this);
        }
        if (typeof (ev.dwtObj as BuddyTreeItem).isBuddyTreeItem !== "undefined"
          && (ev.dwtObj as BuddyTreeItem).isBuddyTreeItem()
        ) {
          this.mOnBuddySelectedCbkMgr.run(ev, this);
        } else if (typeof (ev.dwtObj as GroupTreeItem).isGroupTreeItem !== "undefined"
          && (ev.dwtObj as GroupTreeItem).isGroupTreeItem()
        ) {
          this.mOnGroupSelectedCbkMgr.run(ev, this);
        } else if (typeof itemId !== "undefined" && itemId === BuddyListTree.ID_ADD_BUDDY) {
          this.mOnAddFriendSelectionCbkMgr.run();
        }

      }
    }
  }

  public showHideOfflineBuddies(hide: boolean): void {
    this.mHideOfflineBuddies = hide;
    for (const treeItem of this.getChildren()) {
      if (typeof (treeItem as GroupTreeItem).isGroupTreeItem !== "undefined"
        && (treeItem as GroupTreeItem).isGroupTreeItem()
      ) {
        (treeItem as GroupTreeItem).showHideOfflineBuddies(hide);
      }
    }
  }

  public onBuddySelected(callback: Callback): void {
    this.mOnBuddySelectedCbkMgr.addCallback(callback);
  }

  public onAddBuddy(callback: Callback): void {
    this.mOnAddBuddyCbkMgr.run(callback);
  }

  public onBuddyStatusChange(callback: Callback): void {
    this.mOnBuddyStatusChangeCbkMgr.addCallback(callback);
  }

  public onRemoveBuddy(callback: Callback): void {
    this.mOnRemoveBuddyCbkMgr.addCallback(callback);
  }

  public onDeleteBuddy(callback: Callback): void {
    this.mOnDeleteBuddyCbkMgr.addCallback(callback);
  }

  public onRenameBuddy(callback: Callback): void {
    this.mOnRenameBuddyCbkMgr.addCallback(callback);
  }

  public onSendInvitation(callback: Callback): void {
    this.mOnSendInvitationCbkMgr.addCallback(callback);
  }

  public onAcceptInvitation(callback: Callback): void {
    this.mOnAcceptInvitationCbkMgr.addCallback(callback);
  }

  public onRenameGroupSelected(callback: Callback): void {
    this.mOnRenameGroupCbkMgr.addCallback(callback);
  }

  public onDeleteGroupSelected(callback: Callback): void {
    this.mOnDeleteGroupCbkMgr.addCallback(callback);
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
    const data: GroupData[] = [];
    for (const dwtGroup of this.mRootGroup.getChildren()) {
      if (dwtGroup.isGroupTreeItem()) {
        const group: Group = (dwtGroup as GroupTreeItem).getGroup();
        data.push({
          expanded: (dwtGroup as GroupTreeItem).getExpanded(),
          name: group.getName(),
        });
      }
    }
    return data;
  }

  public setGroupsData(data: GroupData[]): void {
    for (const groupData of data) {
      this.recursiveSetGroupData(this.getChildren(), groupData);
    }
  }

  public applyFilter(filterValue: string): void {
    let regex: RegExp;
    try {
      if (filterValue !== "") {
        this.mFilterApplied = filterValue;
      } else {
        this.mFilterApplied = null;
      }
      regex = new RegExp(filterValue, "i");
    } catch (err) {
      filterValue = "";
      this.mFilterApplied = null;
      regex = /\w+/i;
    }
    if (this.mRootGroup.applyFilter(regex) || filterValue === "") {
      this.mNoBuddiesFound.setVisible(false);
    } else {
      this.mNoBuddiesFound.setVisible(true);
    }
    this.updateFixedTreeItemsVisibility();
  }

  public onAddFriendSelection(callback: Callback): void {
    this.mOnAddFriendSelectionCbkMgr.addCallback(callback);
  }

  public getStatistics(): GroupStats {
    return this.mBuddyList.getStatistics();
  }

  public setSortMethod(method: string, sortFunction: SortFcns): void {
    this.mSortMethod = method;
    this.mSortFunction = sortFunction;
    for (const child of this.getChildren()) {
      if (typeof (child as GroupTreeItem).isGroupTreeItem !== "undefined"
        && (child as GroupTreeItem).isGroupTreeItem()
      ) {
        (child as GroupTreeItem).setSortMethod(this.mSortMethod, this.mSortFunction);
      }
    }
  }

  public getGroup(groupName: string): GroupTreeItem {
    for (const dwtGroup of this.mRootGroup.getChildren()) {
      if (typeof (dwtGroup as GroupTreeItem).isGroupTreeItem !== "undefined"
        && (dwtGroup as GroupTreeItem).isGroupTreeItem()
        && (dwtGroup as GroupTreeItem).getGroup().getId() === groupName
      ) {
        return (dwtGroup as GroupTreeItem);
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

  private addGroup(group: Group): void {
    const dwtGroup: GroupTreeItem = new GroupTreeItem(
      this.mRootGroup,
      group,
      this.mAppCtxt,
      this.mMainWindowPluginManager,
    );
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

  private buddyAdded(buddy: IBuddy): void {
    this.updateFixedTreeItemsVisibility();
    this.mOnAddBuddyCbkMgr.run(buddy);
  }

  private buddyStatusChanged(buddy: IBuddy, status: IBuddyStatus): void {
    this.updateFixedTreeItemsVisibility();
    this.applyFilterOnStatusChange();
    this.mOnBuddyStatusChangeCbkMgr.run(buddy, status);
  }

  private buddyRemoved(buddy: IBuddy): void {
    this.updateFixedTreeItemsVisibility();
    this.mOnRemoveBuddyCbkMgr.run(buddy);
  }

  private buddyDeleted(buddy: IBuddy): void {
    this.mOnDeleteBuddyCbkMgr.run(buddy);
  }

  private buddyRenamed(buddy: IBuddy): void {
    this.mOnRenameBuddyCbkMgr.run(buddy);
  }

  private invitationSent(buddy: IBuddy): void {
    this.mOnSendInvitationCbkMgr.run(buddy);
  }

  private invitationAccepted(buddy: IBuddy): void {
    this.mOnAcceptInvitationCbkMgr.run(buddy);
  }

  private renameGroupSelected(group: Group): void {
    this.mOnRenameGroupCbkMgr.run(group);
  }

  private deleteGroupSelected(group: Group): void {
    this.mOnDeleteGroupCbkMgr.run(group);
  }

  private recursiveSetGroupData(children: DwtComposite[] = [], groupData: GroupData): void {
    for (const groupItem of children) {
      if (typeof (groupItem as GroupTreeItem).isGroupTreeItem !== "undefined"
        && (groupItem as GroupTreeItem).isGroupTreeItem()
      ) {
        if ((groupItem as GroupTreeItem).getGroup().getName() === groupData.name) {
          (groupItem as GroupTreeItem).setOriginalExpanded(groupData.expanded);
          (groupItem as GroupTreeItem).setExpanded(groupData.expanded, true, false);
        }
        this.recursiveSetGroupData(groupItem.getChildren(), groupData);
      }
    }
  }

  private updateFixedTreeItemsVisibility(): void {
    const stats = this.mBuddyList.getStatistics();
    const online = stats.getOnlineBuddiesCount();
    const total = stats.getTotalBuddiesCount();
    if (total <= 0) {
      this.mAddBuddyTreeItem.setVisible(true);
      this.mNoOnlineBuddiesTreeItem.setVisible(false);
    } else {
      this.mAddBuddyTreeItem.setVisible(false);
      this.mNoOnlineBuddiesTreeItem.setVisible(online <= 0);
    }
  }

  private applyFilterOnStatusChange() {
    if (typeof this.mFilterApplied !== "undefined" && this.mFilterApplied !== null) {
      this.applyFilter(this.mFilterApplied);
    }
  }

}
// tslint:disable-next-line
declare class ExtendedDwtControl extends DwtControl {
  public onSelection: (ev: DwtEvent, dwtObj: DwtControl) => void;
}
