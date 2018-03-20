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

export class MessageEvent extends ChatEvent {

  public mMessage: string;

  private mMsgId: string;
  private mDate: Date;
  private mDelivered: boolean;
  private mType: "chat" | string;

  constructor(
    msgId: string,
    sender: string,
    destination: string,
    message: string,
    type: "chat" | string,
    eventDate: Date,
    creationDate: Date,
  ) {
    super(OpenChatEventCode.MESSAGE, creationDate, true);
    this.mMsgId = msgId;
    if (typeof sender !== "undefined" && sender !== null) {
      this.setSender(sender);
    }
    if (typeof destination !== "undefined" && destination !== null) {
      this.setDestination(destination);
    }
    this.mMessage = message;
    this.mType = type;
    this.mDate = eventDate;
    this.mDelivered = false;
  }

  public setMessageId(id: string): void {
    this.mMsgId = id;
  }

  public getMessageId(): string {
    return this.mMsgId;
  }

  public getMessage(): string {
    return this.mMessage;
  }

  public getDate(): Date {
    return this.mDate;
  }

  public getType(): string {
    return this.mType;
  }

}
