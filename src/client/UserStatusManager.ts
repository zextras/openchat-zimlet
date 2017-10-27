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

import {BuddyStatusImp} from "./BuddyStatus";
import {BuddyStatusType} from "./BuddyStatusType";
import {IBuddyStatus} from "./IBuddyStatus";
import {IUserStatusManager} from "./IUserStatusManager";

export class UserStatusManager implements IUserStatusManager {

  private mSelectedStatus: IBuddyStatus = new BuddyStatusImp(0, "Available", 0);
  private mUserStatuses: IBuddyStatus[];
  private mAutoAway: boolean = false;
  private mAutoBusy: boolean = false;

  public setSelectedStatus(status: IBuddyStatus): void {
    this.mSelectedStatus = status;
  }

  public getCurrentStatus(): IBuddyStatus {
    let status = this.mSelectedStatus;
    if (this.mAutoAway && status.isOnline()) {
      for (const userStatus of this.mUserStatuses) {
        if (userStatus.getType() === BuddyStatusType.AWAY) {
          status = userStatus;
          break;
        }
      }
    } else if (this.mAutoBusy && status.isOnline()) {
      for (const userStatus of this.mUserStatuses) {
        if (userStatus.getType() === BuddyStatusType.BUSY) {
          status = userStatus;
          break;
        }
      }
    }
    return status;
  }

  public setAutoAway(enabled: boolean): boolean {
    const previousStatusType: BuddyStatusType = this.getCurrentStatus().getType();
    this.mAutoAway = enabled;
    return (previousStatusType !== this.getCurrentStatus().getType());
  }

  public setAutoBusy(enabled: boolean): boolean {
    const previousStatusType: BuddyStatusType = this.getCurrentStatus().getType();
    this.mAutoBusy = enabled;
    return (previousStatusType !== this.getCurrentStatus().getType());
  }

  public setUserStatuses(userStatuses: IBuddyStatus[]): void {
    this.mUserStatuses = userStatuses;
  }

  public getUserStatuses(): IBuddyStatus[] {
    return this.mUserStatuses;
  }

}
