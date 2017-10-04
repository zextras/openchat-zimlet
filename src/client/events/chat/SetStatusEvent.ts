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

import {Command} from "../../connection/soap/Command";
import {ChatEvent} from "../ChatEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class SetStatusEvent extends ChatEvent {

  public static getCommandFromSetStatusEvent(setStatusEvent: SetStatusEvent) {
    if (setStatusEvent.isAuto()) {
      return Command.SET_AUTO_AWAY_STATUS;
    } else {
      return Command.SET_STATUS;
    }
  }

  private mStatusId: string;
  // private mRooms: string[];
  private mAuto: boolean;

  // constructor(statusId: string, rooms: string[], creationDate: Date, auto: boolean = false) {
  constructor(statusId: string, creationDate: Date, auto: boolean = false) {
    super(OpenChatEventCode.SET_STATUS, creationDate, false);
    this.mStatusId = statusId;
    // this.mRooms = rooms;
    this.mAuto = auto;
  }

  public getStatusId(): string {
    return this.mStatusId;
  }

  public isAuto(): boolean {
    return this.mAuto;
  }

  // public getRooms(): string[] {
  //   return this.mRooms;
  // }

  // public setDestinationRoom(address: string): void {
  //   this.setDestination(address);
  // }
}
