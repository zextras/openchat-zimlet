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

import {BuddyStatusImp} from "./BuddyStatusImp";
import {BuddyStatusType} from "./BuddyStatusType";
import {UserStatusManager} from "./UserStatusManager";
import {BuddyStatus} from "./BuddyStatus";

export class UserStatusManagerImp implements UserStatusManager {

  private mSelectedStatus: BuddyStatus = new BuddyStatusImp(0, "Available", 0);
  private mUserStatuses: BuddyStatus[];
  private mAutoAway: boolean = false;
  private mAutoBusy: boolean = false;

  public setSelectedStatus(status: BuddyStatus): void {
    this.mSelectedStatus = status;
  }

  public getCurrentStatus(): BuddyStatus {
    let status = this.mSelectedStatus;
    if (this.mAutoBusy && status.isOnline()) {
      for (let userStatus of this.mUserStatuses) {
        if (userStatus.getType() === BuddyStatusType.BUSY) {
          status = userStatus;
          break;
        }
      }
    }
    else if (this.mAutoAway && status.isOnline()) {
      for (let userStatus of this.mUserStatuses) {
        if (userStatus.getType() === BuddyStatusType.AWAY) {
          status = userStatus;
          break;
        }
      }
    }
    return status;
  }

  public setAutoAway(enabled: boolean): boolean {
    let previousStatusType: BuddyStatusType = this.getCurrentStatus().getType();
    this.mAutoAway = enabled;
    return (previousStatusType !== this.getCurrentStatus().getType());
  }

  public setAutoBusy(enabled: boolean): boolean {
    let previousStatusType: BuddyStatusType = this.getCurrentStatus().getType();
    this.mAutoBusy = enabled;
    return (previousStatusType !== this.getCurrentStatus().getType());
  }

  public setUserStatuses(userStatuses: BuddyStatus[]): void {
    this.mUserStatuses = userStatuses;
  }

  public getUserStatuses(): BuddyStatus[] {
    return this.mUserStatuses;
  }

}
