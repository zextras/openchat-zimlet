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

import {Group} from "./Group";
import {Buddy} from "./Buddy";
import {GroupStats} from "./GroupStats";
import {BuddyListEvent} from "./events/chat/BuddyListEvent";
import {Callback} from "../lib/callbacks/Callback";
import {CallbackManager} from "../lib/callbacks/CallbackManager";

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

  public getBuddyById(buddyId: string): Buddy {
    for (let i: number = 0; i < this.mGroups.length; i++) {
      let buddy: Buddy = this.mGroups[i].getBuddyById(buddyId);
      if (typeof buddy !== "undefined") {
        return buddy;
      }
    }
  }

  public removeBuddy(buddy: Buddy): void {
    for (let i: number = 0; i < this.mGroups.length; i++) {
      this.mGroups[i].removeBuddy(buddy);
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
      let oldGroup: Group = this.getGroup(group.getName()),
        newBuddies: Buddy[] = group.getBuddies();
      for (let i: number = 0; i < newBuddies.length; i++) {
        let buddy: Buddy = newBuddies[i];
        buddy.removeGroup(group.getName());
        oldGroup.addBuddy(buddy, false);
        buddy.addGroup(oldGroup);
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
    for (let i: number = 0; i < this.mGroups.length; i++) {
      if (this.mGroups[i].getName() === groupName) {
        return this.mGroups[i];
      }
    }
  }

  public getGroups(): Group[] {
    return this.mGroups;
  }

  public getStatistics(): GroupStats {
    let online: number = 0,
      offline: number = 0,
      invited: number = 0,
      waiting: number = 0;
    for (let i: number = 0; i < this.mGroups.length; i++) {
      let grStats: GroupStats = this.mGroups[i].getStatistics();
      online += grStats.getOnlineBuddiesCount();
      offline += grStats.getOfflineBuddiesCount();
      invited += grStats.getInvitedBuddiesCount();
      waiting += grStats.getWaitingForResponseBuddiesCount();
    }
    return new GroupStats(online, offline, invited, waiting);
  }

  public reset(): void {
    // Map all buddies to be removed
    let buddiesToBeRemoved: {[name: string]: Buddy} = {};
    for (let i: number = 0; i < this.mGroups.length; i++) {
      let buddies: Buddy[] = this.mGroups[i].getBuddies();
      for (let j: number = 0; j < buddies.length; j++) {
        if (buddiesToBeRemoved.hasOwnProperty(buddies[j].getId())) { continue; }
        buddiesToBeRemoved[buddies[j].getId()] = buddies[j];
      }
    }
    this.deleteBuddies(buddiesToBeRemoved);
  }

  public getAllBuddies(): {[name: string]: Buddy} {
    // Map all buddies to be removed
    let retBuddies: {[name: string]: Buddy} = {};
    for (let i: number = 0; i < this.mGroups.length; i++) {
      let buddies: Buddy[] = this.mGroups[i].getBuddies();
      for (let j: number = 0; j < buddies.length; j++) {
        if (buddies.hasOwnProperty(buddies[j].getId())) { continue; }
        retBuddies[buddies[j].getId()] = buddies[j];
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

  private groupRenamed(group: Group, newName: string): void {
    this.mOnRenameGroupCbkMgr.run(group, newName);
  }

  public handleBuddyListEvent(event: BuddyListEvent): boolean {
    let evBuddies: Buddy[] = event.getBuddies(),
      groupsToBeRemoved: {[name: string]: Group} = {},
      buddiesToBeRemoved: {[name: string]: Buddy} = {};

    // Map all groups and buddies for deletion
    for (let i: number = 0; i < this.mGroups.length; i++) {
      if (this.mGroups[i].getName() !== BuddyList.DEFAULT_GROUP_NAME) {
        groupsToBeRemoved[this.mGroups[i].getName()] = this.mGroups[i];
      }
      let buddies: Buddy[] = this.mGroups[i].getBuddies();
      for (let j: number = 0; j < buddies.length; j++) {
        if (buddiesToBeRemoved.hasOwnProperty(buddies[j].getId())) { continue; }
        buddiesToBeRemoved[buddies[j].getId()] = buddies[j];
      }
    }

    // Create new groups, if exists remove from the deletion map
    for (let i: number = 0; i < evBuddies.length; i++) {
      let buddyGroups: Group[] = evBuddies[i].getGroups();
      for (let j: number = 0; j < buddyGroups.length; j++) {
        if (groupsToBeRemoved.hasOwnProperty(buddyGroups[j].getName())) {
          delete groupsToBeRemoved[buddyGroups[j].getName()];
        }
        if (typeof this.getGroup(buddyGroups[j].getName()) === "undefined") {
          this.addGroup(new Group(buddyGroups[j].getName()));
        }
      }
    }

    // Update old buddies or add the new ones
    for (let i: number = 0; i < evBuddies.length; i++) {
      if (buddiesToBeRemoved.hasOwnProperty(evBuddies[i].getId())) {
        delete buddiesToBeRemoved[evBuddies[i].getId()];
      }
      this.updateOrAddBuddy(evBuddies[i]);
    }

    // Delete unnecessary groups and buddies
    this.deleteBuddies(buddiesToBeRemoved);
    this.deleteGroups(groupsToBeRemoved);
    this.triggerSortGroups();
    return true;
  }

  // TODO: You can remove me, maybe one day...
  public changeBuddyGroup(buddy: Buddy, groups: string[], callback?: Callback): boolean {
    this.addBuddyToGroups(buddy, groups, true);
    this.triggerSortGroups();
    if (typeof callback !== "undefined") {
      callback.run();
    }
    return true;
  }

  public addBuddyToGroups(
      buddy: Buddy,
      groups: string[],
      removeEmptyGroups: boolean
  ): void {
    // Remove old groups
    let buddyGroups: Group[] = buddy.getGroups(),
      buddyGroupNames: string[] = [];

    for (let j: number = 0; j < buddyGroups.length; j++) {
      buddyGroupNames.push(buddyGroups[j].getName());
      buddyGroups[j].removeBuddy(buddy);
      if (removeEmptyGroups && buddyGroups[j].isEmpty()) {
        this.removeGroup(buddyGroups[j]);
      }
    }
    for (let j: number = 0; j < buddyGroupNames.length; j++) {
      buddy.removeGroup(buddyGroupNames[j]);
    }

    // Add new groups
    for (let j: number = 0; j < groups.length; j++) {
      let group: Group = this.getGroup(groups[j]);

      buddy.addGroup(group);
      group.addBuddy(buddy, false);
      group.promiseSort();
    }
  }

  public updateOrAddBuddy(buddy: Buddy): void {
    let oldBuddy: Buddy = this.getBuddyById(buddy.getId()),
      buddyGroups: Group[] = buddy.getGroups(),
      buddyGroupsNames: string[] = [];

    for (let j: number = 0; j < buddyGroups.length; j++) {
      buddyGroupsNames.push(buddyGroups[j].getName());
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

  private deleteGroups(groups: {[name: string]: Group}): void {
    for (let groupName in groups) {
      if (!groups.hasOwnProperty(groupName)) { continue; }
      this.removeGroup(groups[groupName]);
    }
  }

  private deleteBuddies(buddiesToBeRemoved: {[name: string]: Buddy}) {
    for (let buddyName in buddiesToBeRemoved) {
      if (!buddiesToBeRemoved.hasOwnProperty(buddyName)) { continue; }
      this.removeBuddy(buddiesToBeRemoved[buddyName]);
    }
  }

  public triggerSortGroups(): void {
      for (let group of this.mGroups) {
        group.triggerSort();
      }
    }

}
