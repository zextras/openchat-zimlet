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
import {LeftConversationEvent} from "../../../../events/chat/LeftConversationEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {WritingStatusEvent} from "../../../../events/chat/WritingStatusEvent";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class WritingStatusEventDecoder extends SoapEventDecoder<WritingStatusEvent|LeftConversationEvent> {

  public mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.WRITING_STATUS);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: IWritingStatusEventObj,
    originEvent?: IChatEvent,
  ): WritingStatusEvent|LeftConversationEvent {
    if (eventObj.writingValue === LeftConversationEvent.LEFT_CONVERSATION) {
      return new LeftConversationEvent(
        eventObj.from,
        eventObj.to,
        this.mDateProvider.getDate(eventObj.timestampSent),
        this.mDateProvider.getNow(),
      );
    } else {
      return new WritingStatusEvent(
        eventObj.from,
        eventObj.to,
        this.mDateProvider.getDate(eventObj.timestampSent),
        this.mDateProvider.getNow(),
        eventObj.writingValue,
      );
    }
  }

}

interface IWritingStatusEventObj extends ISoapEventObject {
  writingValue: number;
  from: string;
  to: string;
  timestampSent: number;
}
