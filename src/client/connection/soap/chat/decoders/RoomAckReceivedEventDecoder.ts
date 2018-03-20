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
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {RoomAckReceivedEvent} from "../../../../events/chat/RoomAckReceivedEvent";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class RoomAckReceivedEventDecoder extends SoapEventDecoder<RoomAckReceivedEvent> {
  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.ROOM_ACK);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: IMessageAckReceivedEventObj,
    originEvent?: IChatEvent,
  ): RoomAckReceivedEvent {
    return new RoomAckReceivedEvent(
      eventObj.from,
      eventObj.to,
      new Date(eventObj.message_date),
      eventObj.message_id,
    );
  }

}

interface IMessageAckReceivedEventObj extends ISoapEventObject {
  from: string;
  to: string;
  message_date: number;
  message_id: string;
}
