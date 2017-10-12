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

import {Callback} from "../lib/callbacks/Callback";
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {BuddyListEvent} from "./events/chat/BuddyListEvent";
import {Group} from "./Group";
import {GroupStats} from "./GroupStats";
import {IBuddy} from "./IBuddy";

export class BuddyList {

  public static DEFAULT_GROUP_NAME: string = "";

  private mGroups: Group[];
  private mDefaultGroup: Group;

  private mOnAddGroupCbkMgr: CallbackManager = new CallbackManager();
  private mOnRemoveGroupCbkMgr: CallbackManager = new CallbackManager();
  private mOnRenameGroupCbkMgr: CallbackManager = new CallbackManager();
  private mOnBuddyAddedCbkMgr: CallbackManager = new CallbackManager();
  private mOnBuddyRemovedCbkMgr: CallbackManager = new CallbackManager();

  constructor() {
    this.mGroups = [];
    this.mDefaultGroup = new Group(BuddyList.DEFAULT_GROUP_NAME);
    this.mGroups.push(this.mDefaultGroup);
  }

  public getDefaultGroup(): Group {
    return this.mDefaultGroup;
  }

  public getBuddyById(buddyId: string): IBuddy {
    for (const group of this.mGroups) {
      const buddy: IBuddy = group.getBuddyById(buddyId);
      if (typeof buddy !== "undefined") {
        return buddy;
      }
    }
  }

  public removeBuddy(buddy: IBuddy): void {
    for (const group of this.mGroups) {
      group.removeBuddy(buddy);
    }
    this.mOnBuddyRemovedCbkMgr.run(buddy);
  }

  public addGroup(group: Group): void {
    if (typeof this.getGroup(group.getName()) === "undefined") {
      this.mGroups.push(group);
      group.onNameChange(new Callback(this, this.groupRenamed, group));
      this.mOnAddGroupCbkMgr.run(group);
    } else {
      // If the group is already present, migrate his buddies to the old group.
      const oldGroup: Group = this.getGroup(group.getName());
      const newBuddies: IBuddy[] = group.getBuddies();
      for (const newBuddy of newBuddies) {
        newBuddy.removeGroup(group.getName());
        oldGroup.addBuddy(newBuddy, false);
        newBuddy.addGroup(oldGroup);
      }
    }
  }

  public removeGroup(group: Group): void {
    if (group.getName() === BuddyList.DEFAULT_GROUP_NAME) { return; }
    if (typeof this.getGroup(group.getName()) === "undefined") { return; }
    let index: number = -1;
    for (let i: number = 0; i < this.mGroups.length; i++) {
      if (group.getId() === this.mGroups[i].getId()) {
        index = i;
      }
    }
    this.mGroups.splice(index, 1);
    this.mOnRemoveGroupCbkMgr.run(group);
  }

  public getGroup(groupName: string = ""): Group {
    for (const group of this.mGroups) {
      if (group.getName() === groupName) {
        return group;
      }
    }
  }

  public getGroups(): Group[] {
    return this.mGroups;
  }

  public getStatistics(): GroupStats {
    let online: number = 0;
    let offline: number = 0;
    let invited: number = 0;
    let waiting: number = 0;
    for (const group of this.mGroups) {
      const grStats: GroupStats = group.getStatistics();
      online += grStats.getOnlineBuddiesCount();
      offline += grStats.getOfflineBuddiesCount();
      invited += grStats.getInvitedBuddiesCount();
      waiting += grStats.getWaitingForResponseBuddiesCount();
    }
    return new GroupStats(online, offline, invited, waiting);
  }

  public reset(): void {
    // Map all buddies to be removed
    const buddiesToBeRemoved: {[name: string]: IBuddy} = {};
    for (const group of this.mGroups) {
      const buddies: IBuddy[] = group.getBuddies();
      for (const buddy of buddies) {
        if (buddiesToBeRemoved.hasOwnProperty(buddy.getId())) { continue; }
        buddiesToBeRemoved[buddy.getId()] = buddy;
      }
    }
    this.deleteBuddies(buddiesToBeRemoved);
  }

  public getAllBuddies(): {[name: string]: IBuddy} {
    // Map all buddies to be removed
    const retBuddies: {[name: string]: IBuddy} = {};
    for (const group of this.mGroups) {
      const buddies: IBuddy[] = group.getBuddies();
      for (const buddy of buddies) {
        if (buddies.hasOwnProperty(buddy.getId())) { continue; }
        retBuddies[buddy.getId()] = buddy;
      }
    }
    return retBuddies;
  }

  public onAddGroup(callback: Callback): void {
    this.mOnAddGroupCbkMgr.addCallback(callback);
  }

  public onRemoveGroup(callback: Callback): void {
    this.mOnRemoveGroupCbkMgr.addCallback(callback);
  }

  public onAddBuddy(callback: Callback): void {
    this.mOnBuddyAddedCbkMgr.addCallback(callback);
  }

  public onRemoveBuddy(callback: Callback): void {
    this.mOnBuddyRemovedCbkMgr.addCallback(callback);
  }

  public onRenameGroup(callback: Callback): void {
    this.mOnRenameGroupCbkMgr.addCallback(callback);
  }

  public handleBuddyListEvent(event: BuddyListEvent): boolean {
    const evBuddies: IBuddy[] = event.getBuddies();
    const groupsToBeRemoved: {[name: string]: Group} = {};
    const buddiesToBeRemoved: {[name: string]: IBuddy} = {};

    // Map all groups and buddies for deletion
    for (const group of this.mGroups) {
      if (group.getName() !== BuddyList.DEFAULT_GROUP_NAME) {
        groupsToBeRemoved[group.getName()] = group;
      }
      const buddies: IBuddy[] = group.getBuddies();
      for (const buddy of buddies) {
        if (buddiesToBeRemoved.hasOwnProperty(buddy.getId())) { continue; }
        buddiesToBeRemoved[buddy.getId()] = buddy;
      }
    }

    // Create new groups, if exists remove from the deletion map
    for (const evBuddy of evBuddies) {
      const buddyGroups: Group[] = evBuddy.getGroups();
      for (const buddyGroup of buddyGroups) {
        if (groupsToBeRemoved.hasOwnProperty(buddyGroup.getName())) {
          delete groupsToBeRemoved[buddyGroup.getName()];
        }
        if (typeof this.getGroup(buddyGroup.getName()) === "undefined") {
          this.addGroup(new Group(buddyGroup.getName()));
        }
      }
    }

    // Update old buddies or add the new ones
    for (const evBuddy of evBuddies) {
      if (buddiesToBeRemoved.hasOwnProperty(evBuddy.getId())) {
        delete buddiesToBeRemoved[evBuddy.getId()];
      }
      this.updateOrAddBuddy(evBuddy);
    }

    // Delete unnecessary groups and buddies
    this.deleteBuddies(buddiesToBeRemoved);
    this.deleteGroups(groupsToBeRemoved);
    this.triggerSortGroups();
    return true;
  }

  // TODO: You can remove me, maybe one day...
  public changeBuddyGroup(buddy: IBuddy, groups: string[], callback?: Callback): boolean {
    this.addBuddyToGroups(buddy, groups, true);
    this.triggerSortGroups();
    if (typeof callback !== "undefined") {
      callback.run();
    }
    return true;
  }

  public addBuddyToGroups(
      buddy: IBuddy,
      groups: string[],
      removeEmptyGroups: boolean,
  ): void {
    // Remove old groups
    const buddyGroups: Group[] = buddy.getGroups();
    const buddyGroupNames: string[] = [];

    for (const buddyGroup of buddyGroups) {
      buddyGroupNames.push(buddyGroup.getName());
      buddyGroup.removeBuddy(buddy);
      if (removeEmptyGroups && buddyGroup.isEmpty()) {
        this.removeGroup(buddyGroup);
      }
    }
    for (const buddyGroupName of buddyGroupNames) {
      buddy.removeGroup(buddyGroupName);
    }

    // Add new groups
    for (const groupName of groups) {
      const group: Group = this.getGroup(groupName);

      buddy.addGroup(group);
      group.addBuddy(buddy, false);
      group.promiseSort();
    }
  }

  public updateOrAddBuddy(buddy: IBuddy): void {
    const oldBuddy: IBuddy = this.getBuddyById(buddy.getId());
    const buddyGroups: Group[] = buddy.getGroups();
    const buddyGroupsNames: string[] = [];

    for (const group of buddyGroups) {
      buddyGroupsNames.push(group.getName());
    }

    if (typeof oldBuddy === "undefined") {
      // Add the buddy as new
      this.addBuddyToGroups(buddy, buddyGroupsNames, false);
      this.mOnBuddyAddedCbkMgr.run(buddy);
    } else {
      // Update the old buddy
      oldBuddy.setNickname(buddy.getNickname());
      oldBuddy.clearStatuses();
      oldBuddy.setStatus(buddy.getStatus());
      this.addBuddyToGroups(oldBuddy, buddyGroupsNames, false);
    }
  }

  public triggerSortGroups(): void {
      for (const group of this.mGroups) {
        group.triggerSort();
      }
    }

  private deleteGroups(groups: {[name: string]: Group}): void {
    for (const groupName in groups) {
      if (!groups.hasOwnProperty(groupName)) { continue; }
      this.removeGroup(groups[groupName]);
    }
  }

  private deleteBuddies(buddiesToBeRemoved: {[name: string]: IBuddy}) {
    for (const buddyName in buddiesToBeRemoved) {
      if (!buddiesToBeRemoved.hasOwnProperty(buddyName)) { continue; }
      this.removeBuddy(buddiesToBeRemoved[buddyName]);
    }
  }

  private groupRenamed(group: Group, newName: string): void {
    this.mOnRenameGroupCbkMgr.run(group, newName);
  }

}
