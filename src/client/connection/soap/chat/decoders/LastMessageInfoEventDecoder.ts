/*
 * Copyright (C) 2018 ZeXtras S.r.l.
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
import {ILastMessageInfo} from "../../../../../redux/IOpenChatState";
import {LastMessageInfoEvent} from "../../../../events/chat/LastMessageInfoEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class LastMessageInfoEventDecoder extends SoapEventDecoder<LastMessageInfoEvent> {

  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.LAST_MESSAGE_INFO);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: ILastMessageInfoEventObj, originEvent?: IChatEvent): LastMessageInfoEvent {
    let count: number = 0;
    if (eventObj.hasOwnProperty("count")) {
      count = eventObj.count;
    }
    let sent: ILastMessageInfo = null;
    if (eventObj.hasOwnProperty("last_message_sent")) {
      sent = {
        date: this.mDateProvider.getDate(eventObj.last_message_sent.date),
        id: eventObj.last_message_sent.id,
      };
    }
    let incoming: ILastMessageInfo = null;
    if (eventObj.hasOwnProperty("last_message_received")) {
      incoming = {
        date: this.mDateProvider.getDate(eventObj.last_message_received.date),
        id: eventObj.last_message_received.id,
      };
    }
    return new LastMessageInfoEvent(
      eventObj.from,
      eventObj.to,
      this.mDateProvider.getNow(),
      count,
      sent,
      incoming,
    );
  }

}

interface ILastMessageInfoEventObj extends ISoapEventObject {
  from: string;
  to: string;
  count?: number;
  last_message_sent?: ILastMessageInfoObj;
  last_message_received?: ILastMessageInfoObj;
}

interface ILastMessageInfoObj {
  id: string;
  date: number;
}
