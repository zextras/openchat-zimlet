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
import {BuddySessionKeeper} from "./BuddySessionKeeper";
import {Group} from "./Group";
import {IBuddy} from "./IBuddy";
import {IBuddyStatus} from "./IBuddyStatus";

export class Buddy implements IBuddy {

  private static filterFcnReturnTrue(group: Group): boolean {
    return true;
  }

  private mSessionKeeper: BuddySessionKeeper = new BuddySessionKeeper();
  private mOnStatusChangeCbkMgr: CallbackManager = new CallbackManager();
  private mOnNicknameChangeCbkMgr: CallbackManager = new CallbackManager();

  private mId: string;
  private mNickname: string;
  private mGroups: Group[];

  constructor(
    id: string,
    nickname: string,
    groups: Group[] = [],
  ) {
    this.mId = id;
    this.mNickname = nickname;
    this.mGroups = groups;
  }

  public getId(): string {
    return this.mId;
  }

  public setNickname(newNick: string): void {
    const isChanged: boolean = (this.mNickname !== newNick);
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
    const indexes: number[] = [];
    for (let i = 0; i < this.mGroups.length; i += 1) {
      if (groupName === this.mGroups[i].getName()) {
        indexes.push(i);
      }
    }
    indexes.reverse();
    for (const index of indexes) {
      this.mGroups.splice(index, 1);
    }
  }

  public getGroups(filterFcn?: (val: any) => boolean): Group[] {
    if (typeof filterFcn !== "function") {
      filterFcn = Buddy.filterFcnReturnTrue;
    }
    return ArrayUtils.filter(this.mGroups, filterFcn);
  }

  public setStatus(status: IBuddyStatus, resource: string = "default"): void {
    const currentStatus: IBuddyStatus = this.getStatus();
    this.mSessionKeeper.writeStatus(resource, status);
    if (!currentStatus.equals(this.getStatus())) {
      this.mOnStatusChangeCbkMgr.run(this, this.getStatus());
    }
  }

  public clearStatuses(): void {
    this.mSessionKeeper.clear();
  }

  public getStatus(): IBuddyStatus {
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
   * (buddy: IBuddy, status: IBuddyStatus)
   */
  public onStatusChange(callback: Callback): void {
    this.mOnStatusChangeCbkMgr.addCallback(Callback.standardize(callback));
  }

  public filterTest(regex: RegExp): boolean {
    return (regex.test(this.mId) || regex.test(this.mNickname));
  }

}
