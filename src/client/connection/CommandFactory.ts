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

import {ZxError} from "../../lib/error/ZxError";
import {ZxErrorCode} from "../../lib/error/ZxErrorCode";
import {IChatEvent} from "../events/IChatEvent";
import {ICommandFactory} from "./ICommandFactory";

export class CommandFactory implements ICommandFactory {

  public mCommandsMap: {[eventId: number]: string} = {};
  public mSpecialCommandsMap: {[eventId: number]: (event: IChatEvent) => string} = {};

  public addCommand(eventId: number, command: string): void {
    this.mCommandsMap[eventId] = command;
  }

  public addSpecialCommand(eventId: number, controlFunction: (event: IChatEvent) => string): void {
    this.mSpecialCommandsMap[eventId] = controlFunction;
  }

  public getCommand(event: IChatEvent): string {
    if (typeof event.getCode() !== "undefined" && event.getCode() !== null) {
      if (this.mCommandsMap.hasOwnProperty(event.getCode().toString())) {
        return this.mCommandsMap[event.getCode()];
      } else if (this.mSpecialCommandsMap.hasOwnProperty(event.getCode().toString())) {
        return this.mSpecialCommandsMap[event.getCode()](event);
      }
    }
    const error = new ZxError(ZxErrorCode.UNABLE_TO_FIND_COMMAND_FOR_EVENT);
    error.setDetail("eventId", event.getCode().toString());
    throw error;
  }

}
