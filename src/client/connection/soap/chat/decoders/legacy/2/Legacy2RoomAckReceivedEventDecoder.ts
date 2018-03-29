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

import {IDateProvider} from "../../../../../../../lib/IDateProvider";
import {Legacy2RoomAckReceivedEvent} from "../../../../../../events/chat/legacy/2/Legacy2RoomAckReceivedEvent";
import {OpenChatEventCode} from "../../../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../../../events/IChatEvent";
import {ISoapEventObject} from "../../../SoapEventParser";
import {SoapEventDecoder} from "../../SoapEventDecoder";

export class Legacy2RoomAckReceivedEventDecoder extends SoapEventDecoder<Legacy2RoomAckReceivedEvent> {
  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.ROOM_ACK);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: ILegacy2MessageAckReceivedEventObj,
    originEvent?: IChatEvent,
  ): Legacy2RoomAckReceivedEvent {
    return new Legacy2RoomAckReceivedEvent(
      eventObj.from,
      eventObj.to,
      eventObj.ID,
    );
  }

}

interface ILegacy2MessageAckReceivedEventObj extends ISoapEventObject {
  ID: string;
  from: string;
  to: string;
  type: 10;
}
