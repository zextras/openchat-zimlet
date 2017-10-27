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

import {IBuddy} from "../../IBuddy";
import {ChatEvent} from "../ChatEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class BuddyListEvent extends ChatEvent {

  private mBuddies: IBuddy[] = [];

  constructor(creationDate: Date) {
    super(OpenChatEventCode.BUDDY_LIST, creationDate, true);
  }

  /**
   * Register a buddy into the buddy list event
   * @param buddy
   */
  public addBuddy(buddy: IBuddy): void {
    this.mBuddies.push(buddy);
  }

  /**
   * Get all the buddies contained in the buddy list event
   * @return {IBuddy[]}
   */
  public getBuddies(): IBuddy[] {
    return this.mBuddies;
  }
}
