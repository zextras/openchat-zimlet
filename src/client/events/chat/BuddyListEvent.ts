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

import {ChatEvent} from "../ChatEvent";
import {Buddy} from "../../Buddy";

export class BuddyListEvent extends ChatEvent {

  public static ID: number = 7;

  private mBuddies: Buddy[] = [];

  constructor(creationDate: Date) {
    super(BuddyListEvent.ID, creationDate, true);
  }

  /**
   * Register a buddy into the buddy list event
   * @param buddy
   */
  public addBuddy(buddy: Buddy): void {
    this.mBuddies.push(buddy);
  }

  /**
   * Get all the buddies contained in the buddy list event
   * @return {Buddy[]}
   */
  public getBuddies(): Buddy[] {
    return this.mBuddies;
  }
}