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

import {SoapEventDecoder} from "./SoapEventDecoder";
import {ChatEvent} from "../../../../events/ChatEvent";
import {MessageEvent} from "../../../../events/chat/MessageEvent";
import {MessageSentEvent} from "../../../../events/chat/MessageSentEvent";
import {DateProvider} from "../../../../../lib/DateProvider";

export class MessageEventDecoder extends SoapEventDecoder {

  private mDateProvider: DateProvider;
  private mSuperSecretMessageDecoder: SoapEventDecoder;

  constructor(dateProvider: DateProvider, superSecretMessageDecoder: SoapEventDecoder) {
    super(MessageEvent.ID);
    this.mDateProvider = dateProvider;
    this.mSuperSecretMessageDecoder = superSecretMessageDecoder;
  }

  public decodeEvent(
    eventObj: {
      message_type?: string,
      ID?: string,
      from?: string,
      to?: string,
      message?: string,
      timestampSent?: number,
      message_id?: string
    },
    originEvent?: ChatEvent
  ): ChatEvent {
    if (typeof originEvent !== "undefined") {
      return this.decodeMessageSent(<{message_id: string}>eventObj);
    } else {
      return this.decodeMessage(<{
        message_type: string,
        ID: string,
        from: string,
        to: string,
        message: string,
        timestampSent: number
      }>eventObj, originEvent);
    }
  }

  private decodeMessageSent(eventObj: {message_id: string}): ChatEvent {
    return new MessageSentEvent(eventObj["message_id"], this.mDateProvider.getNow());
  }

  private decodeMessage(
    eventObj: {
      message_type: string,
      ID: string,
      from: string,
      to: string,
      message: string,
      timestampSent: number
    },
    originEvent?: ChatEvent
  ): ChatEvent {
    try {
      return this.mSuperSecretMessageDecoder.decodeEvent(eventObj, originEvent);
    } catch (error) {
      let messageType: string = eventObj["message_type"];
      if (eventObj["message_type"] !== undefined) {
        messageType = eventObj["message_type"].toLowerCase();
      }
      return new MessageEvent(
        eventObj["ID"],
        eventObj["from"],
        eventObj["to"],
        eventObj["message"],
        messageType,
        this.mDateProvider.getDate(eventObj["timestampSent"]),
        this.mDateProvider.getNow()
      );
    }
  }
}
