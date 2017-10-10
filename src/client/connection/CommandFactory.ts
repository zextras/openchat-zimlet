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

import {ChatEvent} from "../events/ChatEvent";
import {ZxErrorCode} from "../../lib/error/ZxErrorCode";
import {ZxError} from "../../lib/error/ZxError";

export class CommandFactory {

  mCommandsMap: {[eventId: number]: string} = {};
  mSpecialCommandsMap: {[eventId: number]: Function} = {};

  public addCommand(eventId: number, command: string): void {
    this.mCommandsMap[eventId] = command;
  }

  public addSpecialCommand(eventId: number, controlFunction: Function): void {
    this.mSpecialCommandsMap[eventId] = controlFunction;
  }

  public getCommand(event: ChatEvent): string {
    if (typeof event.getCode() !== "undefined" && event.getCode() !== null) {
      if (this.mCommandsMap.hasOwnProperty(event.getCode().toString())) {
        return this.mCommandsMap[event.getCode()];
      }
      else if (this.mSpecialCommandsMap.hasOwnProperty(event.getCode().toString())) {
        return this.mSpecialCommandsMap[event.getCode()](event);
      }
    }
    let error = new ZxError(ZxErrorCode.UNABLE_TO_FIND_COMMAND_FOR_EVENT);
    error.setDetail("eventId", event.getCode().toString());
    throw error;
  }

}
