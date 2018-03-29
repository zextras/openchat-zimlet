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

import {BuddyStatus} from "../../../../../../BuddyStatus";
import {ContactInformationEvent} from "../../../../../../events/chat/ContactInformationEvent";
import {Legacy2ContactInformationEvent} from "../../../../../../events/chat/legacy/2/Legacy2ContactInformationEvent";
import {IChatEvent} from "../../../../../../events/IChatEvent";
import {ISoapEventObject} from "../../../SoapEventParser";
import {ContactInformationEventDecoder} from "../../ContactInformationEventDecoder";

export class Legacy2ContactInformationEventDecoder extends ContactInformationEventDecoder {

  public decodeEvent(
    eventObj: IContactInformationEventObj,
    originEvent?: IChatEvent,
  ): ContactInformationEvent {
    return new Legacy2ContactInformationEvent(
      eventObj.from,
      this.mDateProvider.getDate(eventObj.timestampSent),
      this.mDateProvider.getNow(),
      new BuddyStatus(
        BuddyStatus.GetTypeFromNumber(eventObj.statusType),
        eventObj.message,
        eventObj.id,
      ),
    );
  }

}

interface IContactInformationEventObj extends ISoapEventObject {
  from: string;
  id: number;
  meetings: string[];
  message: string;
  statusType: number;
  timestampSent: number;
}
