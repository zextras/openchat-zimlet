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

import {Callback} from "../lib/callbacks/Callback";
import {IBuddyStatus} from "./IBuddyStatus";
import {Group} from "./Group";

export interface IBuddy {

  getId(): string;
  setNickname(newNick: string): void;
  getNickname(): string;
  addGroup(group: Group): void;
  removeGroup(groupName: string): void;
  getGroups(filterFcn?: (g: Group) => boolean): Group[];
  setStatus(status: IBuddyStatus, resource?: string): void;
  clearStatuses(): void;
  getStatus(): IBuddyStatus;
  /**
   * Callback function params:
   * (nickName: string)
   */
  onNicknameChange(callback: Callback): void;
  /**
   * Callback function params:
   * (buddy: IBuddy)
   */
  onStatusChange(callback: Callback): void;
  filterTest(regex: RegExp): boolean;

}
