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
import {BuddyStatus} from "../../BuddyStatus";
import {MessageType} from "./MessageEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class ContactInformationEvent extends ChatEvent {

  private mEventDate: Date;
  private mStatus: BuddyStatus;
  private mIsGroupChat: boolean;

  constructor(from: string, eventDate: Date, creationDate: Date, status: BuddyStatus, isGroupChat: boolean = false) {
    super(OpenChatEventCode.CONTACT_INFORMATION, creationDate, true);
    this.setSender(from);
    this.mEventDate = eventDate;
    this.mStatus = status;
    this.mIsGroupChat = isGroupChat;
  }

  public getDate(): Date {
    return this.mEventDate;
  }

  public getStatus(): BuddyStatus {
    return this.mStatus;
  }

  public getContactType(): MessageType {
    let contactType = MessageType.CHAT;
    if (this.mIsGroupChat) {
      contactType = MessageType.GROUPCHAT;
    }
    return contactType;
  }
}
