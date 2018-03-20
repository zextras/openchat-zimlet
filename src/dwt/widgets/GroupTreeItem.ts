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
import {ArrayUtils} from "../../lib/ArrayUtils";
import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {LearningClipUtils} from "../../lib/LearningClipUtils";
import {LogEngine} from "../../lib/log/LogEngine";
import {Logger} from "../../lib/log/Logger";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {StringUtils} from "../../lib/StringUtils";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {Setting} from "../../settings/Setting";
import {DwtDropEvent} from "../../zimbra/ajax/dwt/dnd/DwtDropEvent";
import {DwtMouseEvent} from "../../zimbra/ajax/dwt/events/DwtMouseEvent";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtMenu} from "../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtTreeItem, DwtTreeItemParams} from "../../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmContact} from "../../zimbra/zimbraMail/abook/model/ZmContact";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {DropTarget} from "../dnd/DropTarget";
import {TransferType} from "../dnd/TransferType";
import {IdGenerator} from "../IdGenerator";
import {SortFcns} from "../SortFcns";
import {BuddyTreeItem} from "./BuddyTreeItem";
import {IDwtChatTreeItem} from "./DwtChatTreeItem";
import {GroupTreeItemActionMenuFactory} from "./GroupTreeItemActionMenuFactory";

import "./GroupTreeItem.scss";

export class GroupTreeItem extends DwtTreeItem implements IDwtChatTreeItem {

  public static MAX_LENGTH: number = ZimbraUtils.isUniversalUI() ? 217 : 150;

  private Log: Logger;
  private mMainWindowPluginManager: ChatPluginManager;
  private mRefGroup: Group;
  private mAppCtxt: ZmAppCtxt;
  private mOriginalExpanded: boolean;
  private mHideOfflineBuddies: boolean;
  private mSortMethod: string;
  private mSortFunction: SortFcns;
  private mOnDeleteBuddyCbkMgr: CallbackManager;
  private mOnRenameBuddyCbkMgr: CallbackManager;
  private mOnRenameGroupCbkMgr: CallbackManager;
  private mOnDeleteGroupCbkMgr: CallbackManager;
  private mOnSendInvitationCbkMgr: CallbackManager;
  private mOnAcceptInvitationCbkMgr: CallbackManager;
  private mOnBuddyDroppedInGroupCbkMgr: CallbackManager;
  private mOnContactDroppedInGroupCbkMgr: CallbackManager;
  private mOnBuddyStatusChangeCbkMgr: CallbackManager;
  private mOnGroupExpandCollapseCbkMgr: CallbackManager;
  private mActionMenu: DwtMenu;

  constructor(
    parent: DwtComposite,
    group: Group,
    appCtxt: ZmAppCtxt,
    mainWindowPluginManager: ChatPluginManager,
  ) {
    const isDefault: boolean = group.getName() === BuddyList.DEFAULT_GROUP_NAME;
    const groupParams: DwtTreeItemParams = {
      dndScrollCallback: parent._dndScrollCallback,
      dndScrollId: parent._dndScrollId,
      id: IdGenerator.generateId(`ZxChat_GroupTreeItem_${group.getName()}`),
      parent: parent,
    };
    if (isDefault) {
      groupParams.className = "FirstOverviewHeader overviewHeader";
      groupParams.text = StringUtils.getMessage("online_offline_count", ["0", "0"]);
      groupParams.selectable = false;
      groupParams.arrowDisabled = true;
    } else {
      let treeText: string = group.getName();
      if (group.getName().length > 22) {
        treeText = LearningClipUtils.clip(group.getName(), GroupTreeItem.MAX_LENGTH, "DwtTreeItem-Text");
      }
      groupParams.text = treeText;
      groupParams.selectable = true;
    }
    super(groupParams);
    this.setText(group.getName());
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
    this.mRefGroup = group;
    this.mAppCtxt = appCtxt;
    this.mMainWindowPluginManager = mainWindowPluginManager;
    this.showExpansionIcon(!isDefault);
    this.mOriginalExpanded = false;
    this.setVisible(true);
    this.mHideOfflineBuddies = true;
    this.mSortMethod = Setting.BUDDY_SORT_NAME;
    let dropTarget: DropTarget;
    if (typeof ZmContact !== "undefined") {
      dropTarget = new DropTarget ([
        new TransferType("BuddyTreeItem", BuddyTreeItem),
        new TransferType("ZmContact", ZmContact),
      ]);
    } else {
      dropTarget = new DropTarget([
        new TransferType("BuddyTreeItem", BuddyTreeItem),
      ]);
    }
    dropTarget.addDropListener(new AjxListener(this, this.dropListener));
    this.setDropTarget(dropTarget);
    group.onAddBuddy(new Callback(this, this.addBuddy));
    group.onRemoveBuddy(new Callback(this, this.removeBuddy));
    group.onDelete(new Callback(this, this.onDelete));
    group.onNameChange(new Callback(this, this.onNameChange));
    group.onSort(new Callback(this, this.sort));
    for (const buddy of this.mRefGroup.getBuddies()) {
      this.addBuddy(buddy, false);
    }
    if (isDefault) {
      try {
        this.mOriginalExpanded = true;
        this._expand(true, null, true);
      } catch (ignored) {}
    }
    this.mOnDeleteBuddyCbkMgr = new CallbackManager();
    this.mOnRenameBuddyCbkMgr = new CallbackManager();
    this.mOnRenameGroupCbkMgr = new CallbackManager();
    this.mOnDeleteGroupCbkMgr = new CallbackManager();
    this.mOnSendInvitationCbkMgr = new CallbackManager();
    this.mOnAcceptInvitationCbkMgr = new CallbackManager();
    this.mOnBuddyDroppedInGroupCbkMgr = new CallbackManager();
    this.mOnContactDroppedInGroupCbkMgr = new CallbackManager();
    this.mOnBuddyStatusChangeCbkMgr = new CallbackManager();
    this.mOnGroupExpandCollapseCbkMgr = new CallbackManager();
    if (parent instanceof GroupTreeItem && parent.getChildren().length > 0) {
      (parent as GroupTreeItem)._expand((parent as GroupTreeItem).mOriginalExpanded, null, null, false);
    }
  }

  public isGroupTreeItem(): boolean {
    return true;
  }

  public isBuddyTreeItem(): boolean {
    return false;
  }

  public getChildren(): Array<DwtTreeItem & IDwtChatTreeItem> {
    return super.getChildren() as Array<DwtTreeItem & IDwtChatTreeItem>;
  }

  // Called on setGroupsData
  public setOriginalExpanded(originalExpanded: boolean): void {
    this.mOriginalExpanded = originalExpanded;
  }

  public showHideOfflineBuddies(hide: boolean): void {
    this.mHideOfflineBuddies = hide;
    for (const treeItem of this.getChildren()) {
      if (treeItem.isBuddyTreeItem()) {
        (treeItem as BuddyTreeItem).showHideOffline(hide);
      }
      if (treeItem.isGroupTreeItem()) {
        (treeItem as GroupTreeItem).showHideOfflineBuddies(hide);
      }
    }
  }

  public _expand(expand: boolean, ev: DwtMouseEvent, skipNotify: boolean, notify: boolean = true): void {
    if (typeof this._childDiv === "undefined" || this._childDiv === null) {
      this._realizeDeferredChildren();
    }
    if (typeof this._childDiv === "undefined" || this._childDiv === null) {
      return;
    }
    super._expand(expand, ev, skipNotify);
    if (notify) {
      this.mOriginalExpanded = expand;
    }
    if (typeof this.mOnGroupExpandCollapseCbkMgr !== "undefined" && this.mOnGroupExpandCollapseCbkMgr !== null) {
      this.mOnGroupExpandCollapseCbkMgr.run(this, expand, notify);
    }
  }

  public removeBuddy(buddy: IBuddy): boolean {
    this.Log.debug({
      id: buddy.getId(),
      name: buddy.getNickname(),
    }, "Buddy removed from group");
    for (const child of this.getChildren()) {
      if (
        child.isBuddyTreeItem() && typeof (child as BuddyTreeItem).getBuddy !== "undefined"
        && (child as BuddyTreeItem).getBuddy().getId() === buddy.getId()
      ) {
        this.removeChild(child);
      }
      if (child.isGroupTreeItem()) {
        (child as GroupTreeItem).removeBuddy(buddy);
      }
    }
    return true;
  }

  public updateCounter(): void {
    const stats: GroupStats = this.getGroup().getStatistics().clone();
    for (const child of this.getChildren()) {
      if (child.isGroupTreeItem()) {
        stats.add((child as GroupTreeItem).getGroup().getStatistics());
      }
    }
    let name: string = `${this.getGroup().getName()} ${stats.getOnlineBuddiesCount()}/${stats.getTotalBuddiesCount()}`;
    if (this.getGroup().getName() === BuddyList.DEFAULT_GROUP_NAME) {
      name = StringUtils.getMessage(
        "online_offline_count",
        [stats.getOnlineBuddiesCount().toString(), stats.getOfflineBuddiesCount().toString()],
      );
    }
    if (name.length > 23) {
      name = LearningClipUtils.clip(name, GroupTreeItem.MAX_LENGTH, "DwtTreeItem-Text");
    }
    this.setText(name);
    if (typeof (this.parent as GroupTreeItem).isGroupTreeItem !== "undefined"
      && (this.parent as GroupTreeItem).isGroupTreeItem()
    ) {
      (this.parent as GroupTreeItem).updateCounter();
    }
  }

  public getGroup(): Group {
    return this.mRefGroup;
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

  public onDeleteGroupSelected(callback: Callback): void {
    this.mOnDeleteGroupCbkMgr.addCallback(callback);
  }

  public deleteGroupSelected(): void {
    this.mOnDeleteGroupCbkMgr.run(this.mRefGroup);
  }

  public onRenameGroupSelected(callback: Callback): void {
    this.mOnRenameGroupCbkMgr.addCallback(callback);
  }

  public renameGroupSelected(): void {
    this.mOnRenameGroupCbkMgr.run(this.mRefGroup);
  }

  public onBuddyStatusChange(callback: Callback): void {
    this.mOnBuddyStatusChangeCbkMgr.addCallback(callback);
  }

  public onBuddyDroppedInGroup(callback: Callback): void {
    this.mOnBuddyDroppedInGroupCbkMgr.addCallback(callback);
  }

  public onContactDroppedInGroup(callback: Callback): void {
    this.mOnContactDroppedInGroupCbkMgr.addCallback(callback);
  }

  public onGroupExpandCollapse(callback: Callback): void {
    this.mOnGroupExpandCollapseCbkMgr.addCallback(callback);
  }

  public onAction(ev: DwtSelectionEvent): void {
    if (this.getGroup().getName() === BuddyList.DEFAULT_GROUP_NAME) {
      return;
    }
    if (typeof this.mActionMenu === "undefined" || this.mActionMenu === null) {
      this.mActionMenu = GroupTreeItemActionMenuFactory.createMenu(this, this.mMainWindowPluginManager);
    }
    this.mActionMenu.popup(0, ev.docX, ev.docY, false);
  }

  public setRootGroupLabel(buddyList: BuddyList): void {
    let online: number = 0;
    let offline: number = 0;
    for (const group of buddyList.getGroups()) {
      const stats: GroupStats = group.getStatistics();
      online += stats.getOnlineBuddiesCount();
      offline += stats.getOfflineBuddiesCount();
    }
    this.setText(StringUtils.getMessage("online_offline_count", [online.toString(), offline.toString()]));
  }

  public applyFilter(regex: RegExp): number {
    let itemsShown: number = 0;
    for (const treeItem of this.getChildren()){
      try {
        if (treeItem.isGroupTreeItem()) {
          itemsShown += (treeItem as GroupTreeItem).applyFilter(regex);
        }
        if (treeItem.isBuddyTreeItem()) {
          itemsShown += (treeItem as BuddyTreeItem).applyFilter(regex);
        }
      } catch (err) {
        this.Log.err(err, "GroupTreeItem.applyFilter");
      }
    }
    if (
      regex.toString() === "/(?:)/"
      || regex.toString() === "/(?:)/i"
      || regex.toString() === "//"
      || regex.toString() === "//i"
    ) {
      this._expand(this.mOriginalExpanded, null, null, false);
    } else {
      this._expand(true, null, null, false);
    }
    this.setVisible(true);
    return itemsShown;
  }

  public setSortMethod(sortMethod: string, sortFunction: SortFcns): void {
    this.mSortMethod = sortMethod;
    this.mSortFunction = sortFunction;
    for (const child of this.getChildren()) {
      if (child.isGroupTreeItem()) {
        (child as GroupTreeItem).setSortMethod(this.mSortMethod, this.mSortFunction);
      }
    }
    this.sort();
  }

  public sort(): void {
    if (this.mSortMethod === Setting.BUDDY_SORT_NAME) {
      super.sort(this.mSortFunction.sortBuddyListByNickname);
    } else if (this.mSortMethod === Setting.BUDDY_SORT_PRESENCE) {
      super.sort(this.mSortFunction.sortBuddyListByNickname);
      super.sort(this.mSortFunction.sortBuddyListByStatus);
    }
  }

  public promiseSort(): void {
    this.mRefGroup.promiseSort();
  }

  private addBuddy(buddy: IBuddy, sort: boolean = true): void {
    const buddyItem: BuddyTreeItem = new BuddyTreeItem(this, buddy, this.mAppCtxt, this.mMainWindowPluginManager);
    buddyItem.onDeleteBuddy(new Callback(this, this.buddyDelete));
    buddyItem.onRenameBuddy(new Callback(this, this.buddyRename));
    buddyItem.onSendInvitation(new Callback(this, this.invitationSent));
    buddyItem.onAcceptInvitation(new Callback(this, this.invitationAccepted));
    buddy.onStatusChange(new Callback(this, this.buddyStatusChanged));
    buddy.onStatusChange(new Callback(this, this.promiseSort));
    buddy.onNicknameChange(new Callback(this, this.sort));
    this.updateCounter();
    for (const child of this.getChildren()) {
      if (typeof child.isBuddyTreeItem !== "undefined" && child.isBuddyTreeItem()) {
        this._expand(this.mOriginalExpanded, null, null, false);
        break;
      }
    }
    buddyItem.showHideOffline(this.mHideOfflineBuddies);
    if (sort) {
      this.sort();
    }
  }

  private onNameChange(newName: string): void {
    this.updateCounter();
  }

  private buddyDelete(buddy: IBuddy): void {
    this.mOnDeleteBuddyCbkMgr.run(buddy);
  }

  private buddyRename(buddy: IBuddy): void {
    this.mOnRenameBuddyCbkMgr.run(buddy);
  }

  private invitationSent(buddy: IBuddy): void {
    this.mOnSendInvitationCbkMgr.run(buddy);
  }

  private invitationAccepted(buddy: IBuddy): void {
    this.mOnAcceptInvitationCbkMgr.run(buddy);
  }

  private buddyStatusChanged(buddy: IBuddy, status: IBuddyStatus): void {
    this.updateCounter();
    this.mOnBuddyStatusChangeCbkMgr.run(buddy, status);
  }

  private onDelete(group: Group): void {
    (this.parent as DwtComposite).removeChild(this);
  }

  private dropListener(ev: DwtDropEvent): boolean {
    if (typeof ev.srcData === "undefined" || ev.srcData === null) {
      return false;
    }
    if (ev.action === DwtDropEvent.DRAG_ENTER) {
      let objToCheck = ev.srcData;
      if (typeof ev.srcData.data !== "undefined" && ev.srcData.data !== null) {
        if (ArrayUtils.isArray(ev.srcData.data)) {
          if (ev.srcData.data.length > 1) {
            ev.doIt = false;
            return true;
          } else {
            objToCheck = ev.srcData.data[0];
          }
        } else {
          objToCheck = ev.srcData.data;
        }
      }
      if (
        typeof ev.srcData !== "undefined" && ev.srcData !== null &&
        typeof ev.srcData.getBuddy !== "undefined" && ev.srcData.getBuddy !== null
      ) {
        const buddy: IBuddy = this.getGroup().getBuddyById((ev.srcData as BuddyTreeItem).getBuddy().getId());
        if (typeof buddy !== "undefined" && buddy !== null) {
          ev.doIt = false;
          return true;
        }
      }
      ev.doIt = this.getDropTarget().isValidTarget(objToCheck);
    } else if (ev.action === DwtDropEvent.DRAG_DROP) {
      if (typeof ev.srcData.data !== "undefined" && ev.srcData.data !== null) {
        let contactInfo: ZmContact;
        if (ArrayUtils.isArray(ev.srcData.data)) {
          contactInfo = ev.srcData.data[0];
        } else {
          contactInfo = ev.srcData.data;
        }
        this.mOnContactDroppedInGroupCbkMgr.run(contactInfo, this.getGroup());
      } else if (typeof ev.srcData !== "undefined" && ev.srcData !== null) {
        this.mOnBuddyDroppedInGroupCbkMgr.run((ev.srcData as BuddyTreeItem).getBuddy(), this.getGroup());
      }
    }
    return true;
  }

}
