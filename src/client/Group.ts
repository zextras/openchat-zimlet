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

import {ArrayUtils} from "../lib/ArrayUtils";
import {Callback} from "../lib/callbacks/Callback";
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {AjxStringUtil} from "../zimbra/ajax/util/AjxStringUtil";
import {GroupStats} from "./GroupStats";
import {IBuddy} from "./IBuddy";
import {IBuddyStatus} from "./IBuddyStatus";

export class Group {

  private static buddyFilterFcnReturnTrue(buddy: IBuddy): boolean {
    return true;
  }

  private mId: string;
  private mName: string;
  private mBuddies: IBuddy[] = [];
  private mOnAddBuddyCallbacks: CallbackManager = new CallbackManager();
  private mOnRemoveBuddyCallbacks: CallbackManager = new CallbackManager();
  private mOnNameChangeCallbacks: CallbackManager = new CallbackManager();
  private mOnDeleteCallbacks: CallbackManager = new CallbackManager();
  private mOnSortCbkMgr: CallbackManager = new CallbackManager();
  private promisedSort: boolean = false;

  constructor(name: string) {
    this.mId = this.mName = AjxStringUtil.htmlDecode(name);
  }

  /**
   * Get the group name
   * @return {string}
   */
  public getName(): string {
    return AjxStringUtil.htmlEncode(this.mName);
  }

  /**
   * Get the group id
   * @return {string}
   */
  public getId(): string {
    return this.mId;
  }

  /**
   * Set a new name of the group
   * @param {string} name
   */
  public setName(name: string): void {
    this.mName = AjxStringUtil.htmlDecode(name);
    this.mOnNameChangeCallbacks.run(this.mName);
  }

  /**
   * Set a callback which will be invoked when the group name will be changed
   * @param {Callback} callback
   */
  public onNameChange(callback: Callback): void {
      this.mOnNameChangeCallbacks.addCallback(Callback.standardize(callback));
  }

  /**
   * Get all the buddies contained into the group
   * If a filter function is provided, the list will be filtered
   * @param {function} filterFcn
   * @return {IBuddy[]}
   */
  public getBuddies(filterFcn: (val: any) => boolean = Group.buddyFilterFcnReturnTrue): IBuddy[] {
    return ArrayUtils.filter(this.mBuddies, filterFcn);
  }

  /**
   * Return a buddy by Id
   * @param {string} buddyId
   * @return {IBuddy}
   */
  public getBuddyById(buddyId: string): IBuddy {
    let i: number;
    for (i = 0; i < this.mBuddies.length; i++) {
      if (this.mBuddies[i].getId() === buddyId) {
        return this.mBuddies[i];
      }
    }
  }

  /**
   * Add a buddy to the group
   * @param {IBuddy} buddy
   * @param {boolean} [sortGroup=true]
   */
  public addBuddy(buddy: IBuddy, sortGroup: boolean = true): void {
    this.mBuddies.push(buddy);
    this.mOnAddBuddyCallbacks.run(buddy, sortGroup);
  }

  /**
   * Remove a buddy from this group.
   * @param {IBuddy} buddy
   */
  public removeBuddy(buddy: IBuddy): void {
    const indexes: number[] = [];
    let i: number;
    for (i = 0; i < this.mBuddies.length; i++) {
      if (this.mBuddies[i].getId() === buddy.getId()) {
        indexes.push(i);
      }
    }
    indexes.reverse();
    for (i = 0; i < indexes.length; i++) {
      this.mBuddies.splice(indexes[i], 1);
    }
    if (indexes.length > 0) {
      this.mOnRemoveBuddyCallbacks.run(buddy);
    }
  }

  /**
   * Get if the group is empty
   * @return {boolean}
   */
  public isEmpty(): boolean {
    return this.mBuddies.length === 0;
  }

  /**
   * Set a callback which will be invoked when a buddy is added to the group.
   * @param {Callback} callback
   */
  public onAddBuddy(callback: Callback): void {
    this.mOnAddBuddyCallbacks.addCallback(Callback.standardize(callback));
  }

  /**
   * Set a callback which will be invoked when a buddy is removed to the group.
   * @param {Callback} callback
   */
  public onRemoveBuddy(callback: Callback): void {
    this.mOnRemoveBuddyCallbacks.addCallback(Callback.standardize(callback));
  }

  /**
   * Trigger the deletion callbacks to notify to objects the buddy deletion.
   */
  public deleteGroup(): void {
    this.mOnDeleteCallbacks.run(this);
  }

  /**
   * Set a callback which will be invoked when a buddy is removed to the group.
   * @param {Callback} callback
   */
  public onDelete(callback: Callback) {
    this.mOnDeleteCallbacks.addCallback(Callback.standardize(callback));
  }

  /**
   * Get the group statistics.
   * @return {GroupStats}
   */
  public getStatistics(): GroupStats {
    let online: number = 0;
    let offline: number = 0;
    let invited: number = 0;
    let waiting: number = 0;
    let i: number;
    let buddyStatus: IBuddyStatus;
    for (i = 0; i < this.mBuddies.length; i++) {
      buddyStatus = this.mBuddies[i].getStatus();
      if (buddyStatus.isOnline()) {
        online += 1;
      } else if (buddyStatus.isOffline()) {
        offline += 1;
      } else if (buddyStatus.isInvited()) {
        invited += 1;
      } else if (buddyStatus.isWaitingForResponse()) {
        waiting += 1;
      }
    }

    return new GroupStats(online, offline, invited, waiting);
  }

  /**
   * Clean the group removing all the buddies.
   */
  public reset(): void {
    let i: number;
    const toRemove: IBuddy[] = [];
    for (i = 0; i < this.mBuddies.length; i++) {
      toRemove.push(this.mBuddies[i]);
    }
    for (i = 0; i < toRemove.length; i++) {
      this.removeBuddy(toRemove[i]);
    }
  }

  public onSort(callback: Callback): void {
    this.mOnSortCbkMgr.addCallback(callback);
  }

  public sort(): void {
    this.mOnSortCbkMgr.run();
  }

  public promiseSort(): void {
    this.promisedSort = true;
  }

  public triggerSort(): void {
    if (this.promisedSort) {
      this.sort();
      this.promisedSort = false;
    }
  }
}
