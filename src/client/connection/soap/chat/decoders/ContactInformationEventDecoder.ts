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

import {IDateProvider} from "../../../../../lib/IDateProvider";
import {BuddyStatus} from "../../../../BuddyStatus";
import {ContactInformationEvent} from "../../../../events/chat/ContactInformationEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class ContactInformationEventDecoder extends SoapEventDecoder<ContactInformationEvent> {

  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.CONTACT_INFORMATION);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: IContactInformationEventObj,
    originEvent?: IChatEvent,
  ): ContactInformationEvent {
    return new ContactInformationEvent(
      eventObj.from,
      this.mDateProvider.getDate(eventObj.timestampSent),
      this.mDateProvider.getNow(),
      new BuddyStatus(
        BuddyStatus.GetTypeFromNumber(eventObj.statusType),
        eventObj.message,
        eventObj.id,
      ),
      eventObj.group,
      eventObj.meetings,
      this.mDateProvider.getDate(eventObj.validSince),
    );
  }

}

interface IContactInformationEventObj extends ISoapEventObject {
  from: string;
  group: string;
  id: number;
  meetings: string[];
  message: string;
  statusType: number;
  timestampSent: number;
  validSince: number;
}
