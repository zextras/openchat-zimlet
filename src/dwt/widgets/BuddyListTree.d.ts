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
import {GroupsData} from "../../settings/SettingsManager";
import {SortFcns} from "../SortFcns";
import {MainWindowSortFunction} from "../windows/MainWindow";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";

export declare class BuddyListTree extends DwtTree {

  constructor(
    containerView: DwtComposite,
    buddyList: BuddyList,
    appCtxt: ZmAppCtxt,
    sortFunction: MainWindowSortFunction,
    mainWindowPluginManager: ChatPluginManager
  );

  public rootGroup: GroupTreeItem;
  public onAddFriendSelectionCbkMgr: CallbackManager;

  public getTreeItemList():  DwtTreeItem[];
  public getGroup(groupName: string): GroupTreeItem;
  public onSelection(ev: DwtSelectionEvent): void;
  public showHideOfflineBuddies(hide: boolean): void;
  public setSortMethod(method: string, sortFunction: SortFcns): void;
  public applyFilter(filterValue: string): void;
  public setExpanded(expand: boolean, expandChildren: boolean): void;
  public onBuddySelected(callback: Callback): void;

  public onAddBuddy(callback: Callback): void;
  public onDeleteBuddy(callback: Callback): void;
  public onRemoveBuddy(callback: Callback): void;
  public onRenameBuddy(callback: Callback): void;
  public onBuddyStatusChange(callback: Callback): void;
  public onSendInvitation(callback: Callback): void;
  public onAcceptInvitation(callback: Callback): void;
  public onDeleteGroupSelected(callback: Callback): void;
  public onRenameGroupSelected(callback: Callback): void;
  public onGroupExpandCollapse(callback: Callback): void;
  public onBuddyDroppedInGroup(callback: Callback): void;
  public onContactDroppedInGroup(callback: Callback): void;
  public onAddFriendSelection(callback: Callback): void;
  public getGroupsData(): GroupsData;
  public setGroupsData(data: GroupsData): void;
  public getStatistics(): GroupStats;
  public getRootGroup(): GroupTreeItem;
  public triggerSortGroups(): void;

}
