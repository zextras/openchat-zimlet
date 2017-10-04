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

import {IBuddyStatus} from "./IBuddyStatus";
import {BuddyStatusImp} from "./BuddyStatus";
import {BuddyStatusType} from "./BuddyStatusType";

export class BuddySessionKeeper {

  private mStatusMap: {[address: string]: IBuddyStatus} = {};

  public getMostAvailableStatus(): IBuddyStatus {
    let bestStatus: IBuddyStatus = new BuddyStatusImp(BuddyStatusType.OFFLINE, "Offline", 0);

    for (const address in this.mStatusMap) {
      if (!this.mStatusMap.hasOwnProperty(address)) { continue; }
      if (this.mStatusMap[address].isMoreAvailableThan(bestStatus)) {
        bestStatus = this.mStatusMap[address];
      }
    }

    return bestStatus;
  }

  public writeStatus(resource: string = "default", status: IBuddyStatus): void {
    this.mStatusMap[resource] = status;
    // Fix for ZXCHAT-211
    if (this.mStatusMap.hasOwnProperty("default") && "default" !== resource) {
       delete this.mStatusMap.default;
    }
  }

  public clear(): void {
    this.mStatusMap = {};
  }

}
