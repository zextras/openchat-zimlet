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

import {Buddy} from "./Buddy";
import {BuddySessionKeeper} from "./BuddySessionKeeper";
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {Group} from "./Group";
import {ArrayUtils} from "../lib/ArrayUtils";
import {BuddyStatusImp} from "./BuddyStatusImp";
import {Callback} from "../lib/callbacks/Callback";
import {AjxStringUtil} from "../zimbra/ajax/util/AjxStringUtil";
import {BuddyStatus} from "./BuddyStatus";

export class BuddyImp implements Buddy {

  private mSessionKeeper: BuddySessionKeeper = new BuddySessionKeeper();
  private mOnStatusChangeCbkMgr: CallbackManager = new CallbackManager();
  private mOnNicknameChangeCbkMgr: CallbackManager = new CallbackManager();

  private mId: string;
  private mNickname: string;
  private mGroups: Group[];

  constructor(
    id: string,
    nickname: string,
    groups: Group[] = []
  ) {
    this.mId = id;
    this.mNickname = nickname;
    this.mGroups = groups;
  }

  public getId(): string {
    return this.mId;
  }

  public setNickname(newNick: string): void {
    let isChanged: boolean = (this.mNickname !== newNick);
    this.mNickname = newNick;
    if (isChanged) {
     this.mOnNicknameChangeCbkMgr.run(this.getNickname());
    }
  }

  public getNickname(): string {
    return AjxStringUtil.htmlEncode(this.mNickname);
  }

  public addGroup(group: Group): void {
    this.mGroups.push(group);
  }

  public removeGroup(groupName: string): void {
    let indexes: number[] = [];
    for (let i = 0; i < this.mGroups.length; i += 1) {
      if (groupName === this.mGroups[i].getName()) {
        indexes.push(i);
      }
    }
    indexes.reverse();
    for (let i = 0; i < indexes.length; i += 1) {
      this.mGroups.splice(indexes[i], 1);
    }
  }

  public getGroups(filterFcn?: (val: any) => boolean): Group[] {
    if (typeof filterFcn !== "function") {
      filterFcn = BuddyImp.filterFcnReturnTrue;
    }
    return ArrayUtils.filter(this.mGroups, filterFcn);
  }

  private static filterFcnReturnTrue(group: Group): boolean {
    return true;
  }

  public setStatus(status: BuddyStatus, resource: string = "default"): void {
    let currentStatus: BuddyStatus = this.getStatus();
    this.mSessionKeeper.writeStatus(resource, status);
    if (!currentStatus.equals(this.getStatus())) {
      this.mOnStatusChangeCbkMgr.run(this, this.getStatus());
    }
  }

  public clearStatuses(): void {
    this.mSessionKeeper.clear();
  }

  public getStatus(): BuddyStatus {
    return this.mSessionKeeper.getMostAvailableStatus();
  }

  /**
   * Callback function params:
   * (nickName: string)
   */
  public onNicknameChange(callback: Callback): void {
    this.mOnNicknameChangeCbkMgr.addCallback(Callback.standardize(callback));
  }

  /**
   * Callback function params:
   * (buddy: Buddy, status: BuddyStatus)
   */
  public onStatusChange(callback: Callback): void {
    this.mOnStatusChangeCbkMgr.addCallback(Callback.standardize(callback));
  }

  public filterTest(regex: RegExp): boolean {
    return (regex.test(this.mId) || regex.test(this.mNickname));
  }

}
