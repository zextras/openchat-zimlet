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

import {IBuddyStatus} from "../../IBuddyStatus";
import {ChatEvent} from "../ChatEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class ContactInformationEvent extends ChatEvent {

  private mEventDate: Date;
  private mStatus: IBuddyStatus;
  private mContactType: ContactInformationEventType;
  private mMeetings: string[];
  private mValidSince: Date;

  constructor(
    from: string,
    eventDate: Date,
    creationDate: Date,
    status: IBuddyStatus,
    contactType: ContactInformationEventType,
    meetings?: string[],
    validSince?: Date,
  ) {
    super(OpenChatEventCode.CONTACT_INFORMATION, creationDate, true);
    this.setSender(from);
    this.mEventDate = eventDate;
    this.mStatus = status;
    this.mContactType = contactType;
    this.mMeetings = meetings;
    this.mValidSince = validSince;
  }

  public getDate(): Date {
    return this.mEventDate;
  }

  public getStatus(): IBuddyStatus {
    return this.mStatus;
  }

  public getContactType(): ContactInformationEventType {
    return this.mContactType;
  }

  public getMeetings(): string[] {
    return this.mMeetings;
  }

  public getValidSince(): Date {
    return this.mValidSince;
  }
}

export type ContactInformationEventType = "Chat" | "GroupChat" | "Channel" | "Space";
