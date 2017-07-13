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

export class MessageAckReceivedEvent extends ChatEvent {

  private mMsgId: string;

  constructor(sender: string, destination: string, id: string, creationDate: Date) {
    super(OpenChatEventCode.MESSAGE_ACK, creationDate, false);
    this.setSender(sender);
    this.setDestination(destination);
    this.mMsgId = id;
  }

  public getMessageId(): string {
    return this.mMsgId;
  }
}
