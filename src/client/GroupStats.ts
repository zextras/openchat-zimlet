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

/**
 * Collects the group statistics
 * @class
 */
export class GroupStats {
  private mOnline: number;
  private mOffline: number;
  private mInvited: number;
  private mWaitingResponse: number;

  /**
   * @param {number} online
   * @param {number} offline
   * @param {number} invited
   * @param {number} waitingResponse
   * @constructor
   */
  constructor(online: number = 0,
              offline: number = 0,
              invited: number = 0,
              waitingResponse: number = 0) {
    this.mOnline = online;
    this.mOffline = offline;
    this.mInvited = invited;
    this.mWaitingResponse = waitingResponse;
  }

  /**
   * Get the count of the buddies of the group
   * @return {number}
   */
  public getTotalBuddiesCount(): number {
    return this.mOnline + this.mOffline + this.mInvited + this.mWaitingResponse;
  }

  /**
   * Get the count of the online buddies
   * @return {number}
   */
  public getOnlineBuddiesCount(): number {
    return this.mOnline;
  }

  /**
   * Get the count of the offline buddies
   * @return {number}
   */
  public getOfflineBuddiesCount(): number {
    return this.mOffline;
  }

  /**
   * Get the count of the invited buddies
   * @return {number}
   */
  public getInvitedBuddiesCount(): number {
    return this.mInvited;
  }

  /**
   * Get the count of the buddies which are waiting a response
   * @return {number}
   */
  public getWaitingForResponseBuddiesCount(): number {
    return this.mWaitingResponse;
  }

  /**
   * Add the contenent of the group stats to another.
   * @param {GroupStats} stats
   */
  public add(stats: GroupStats): void {
    this.mOnline += stats.getOnlineBuddiesCount();
    this.mOffline += stats.getOfflineBuddiesCount();
    this.mInvited += stats.getInvitedBuddiesCount();
    this.mWaitingResponse += stats.getWaitingForResponseBuddiesCount();
  }

  /**
   * Clone the GroupStats object, to avoid contamination.
   * @return {GroupStats}
   */
  public clone(): GroupStats {
    return new GroupStats(this.mOnline, this.mOffline, this.mInvited, this.mWaitingResponse);
  }
}
