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

import {BuddyTreeItem} from "./widgets/BuddyTreeItem";
import {GroupTreeItem} from "./widgets/GroupTreeItem";

export class SortFcns {

  public static baseSort(a: string, b: string): number;
  public static baseSort(a: number, b: number): number;
  public static baseSort(a: any, b: any): number {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }

  public static sortBuddiesAndGroups(a: BuddyTreeItem|GroupTreeItem|any, b: BuddyTreeItem|GroupTreeItem|any): number {
    if (typeof a.getBuddy === "function" && typeof b.getGroup === "function") {
      return 1;
    } else if (typeof a.getGroup === "function" && typeof b.getBuddy === "function") {
      return -1;
    } else {
      return 0;
    }
  }

  public static sortGroupsByName(a: GroupTreeItem, b: GroupTreeItem): number {
    if (typeof a.getGroup === "function" && typeof b.getGroup === "function") {
      return SortFcns.baseSort(a.getGroup().getName(), b.getGroup().getName());
    } else {
      return 0;
    }
  }

  public static sortBuddyByNickname(a: BuddyTreeItem, b: BuddyTreeItem): number {
    if (typeof a.getBuddy === "function" && typeof b.getBuddy === "function") {
      return SortFcns.baseSort(a.getBuddy().getNickname(), b.getBuddy().getNickname());
    } else {
      return 0;
    }
  }

  public static sortBuddyByStatus(a: BuddyTreeItem, b: BuddyTreeItem): number {
    if (typeof a.getBuddy === "function" && typeof b.getBuddy === "function") {
      return SortFcns.baseSort(
        a.getBuddy().getStatus().getStatusPriority(),
        b.getBuddy().getStatus().getStatusPriority(),
      );
    } else {
      return 0;
    }
  }

  public sortBuddyListByNickname(a: BuddyTreeItem|GroupTreeItem|any, b: BuddyTreeItem|GroupTreeItem|any): number {
    let sortValue: number = SortFcns.sortBuddiesAndGroups(a, b);
    if (sortValue !== 0) { return sortValue; }
    sortValue = SortFcns.sortGroupsByName(a, b);
    if (sortValue !== 0) { return sortValue; }
    return SortFcns.sortBuddyByNickname(a, b);
  }

  public sortBuddyListByStatus(a: BuddyTreeItem|GroupTreeItem|any, b: BuddyTreeItem|GroupTreeItem|any): number {
    let sortValue: number = SortFcns.sortBuddiesAndGroups(a, b);
    if (sortValue !== 0) { return sortValue; }
    sortValue = SortFcns.sortGroupsByName(a, b);
    if (sortValue !== 0) { return sortValue; }
    sortValue = SortFcns.sortBuddyByStatus(a, b);
    if (sortValue !== 0) { return sortValue; }
    return SortFcns.sortBuddyByNickname(a, b);
  }

}
