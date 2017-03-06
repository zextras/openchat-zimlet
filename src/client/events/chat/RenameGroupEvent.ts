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

export class RenameGroupEvent extends ChatEvent {

  public static ID: number = 24;

  private mGroupName: string;
  private mNewGroupName: string;

  constructor(groupName: string, newGroupName: string, destination: string, creationDate: Date) {
    super(RenameGroupEvent.ID, creationDate, false);

    if (typeof destination !== "undefined" && destination !== null) {
      this.setDestination(destination);
    }
    this.mGroupName = groupName;
    this.mNewGroupName = newGroupName;
  }

  public getGroupName(): string {
    return this.mGroupName;
  }

  public getNewGroupName(): string {
    return this.mNewGroupName;
  }

}
