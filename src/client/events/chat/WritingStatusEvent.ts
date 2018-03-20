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
import {OpenChatEventCode} from "./OpenChatEventCode";

export class WritingStatusEvent extends ChatEvent {

  // TODO: Investigate about the encoding/decoding of the date field.

  public static RESET: number = -1;
  public static WRITTEN: number = 0;
  public static WRITING: number = 1;

  public static fromTypeToString(type: number): "reset" | "isWriting" | "hasWritten" {
    switch (type) {
      case WritingStatusEvent.RESET:
        return "reset";
      case WritingStatusEvent.WRITING:
        return "isWriting";
      case WritingStatusEvent.WRITTEN:
        return "hasWritten";
      default:
        return "reset";
    }
  }

  public static fromStringToType(type: "reset" | "isWriting" | "hasWritten"): number {
    switch (type) {
      case "reset":
        return WritingStatusEvent.RESET;
      case "isWriting":
        return WritingStatusEvent.WRITING;
      case "hasWritten":
        return WritingStatusEvent.WRITTEN;
      default:
        return WritingStatusEvent.RESET;
    }
  }

  private mDate: Date;
  private mValue: number;

  constructor(
    sender: string,
    destination: string,
    eventDate: Date,
    creationDate: Date,
    value: number = WritingStatusEvent.RESET,
  ) {
    super(OpenChatEventCode.WRITING_STATUS, creationDate, false);
    if (typeof sender !== "undefined" && sender !== null) {
      this.setSender(sender);
    }
    if (typeof destination !== "undefined" && destination !== null) {
      this.setDestination(destination);
    }
    this.mValue = value;
    this.mDate = eventDate;
  }

  public getValue(): number {
    return this.mValue;
  }

  public getDate(): Date {
    return this.mDate;
  }

}
