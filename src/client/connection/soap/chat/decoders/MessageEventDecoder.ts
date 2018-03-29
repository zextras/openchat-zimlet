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
import {MessageEvent} from "../../../../events/chat/MessageEvent";
import {MessageSentEvent} from "../../../../events/chat/MessageSentEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {ISecretTestEventObj} from "./SecretTestEventDecoder";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class MessageEventDecoder extends SoapEventDecoder<MessageEvent|MessageSentEvent|IChatEvent> {

  private mDateProvider: IDateProvider;
  private mSuperSecretMessageDecoder: SoapEventDecoder<IChatEvent>;

  constructor(dateProvider: IDateProvider, superSecretMessageDecoder: SoapEventDecoder<IChatEvent>) {
    super(OpenChatEventCode.MESSAGE);
    this.mDateProvider = dateProvider;
    this.mSuperSecretMessageDecoder = superSecretMessageDecoder;
  }

  public decodeEvent(
    eventObj: IMessageReceivedEventObj|IMessageSentEventObj|ISecretTestEventObj,
    originEvent?: IChatEvent,
  ): MessageEvent|MessageSentEvent|IChatEvent {
    if (typeof originEvent !== "undefined") {
      return this.decodeMessageSent(eventObj as IMessageSentEventObj);
    } else {
      return this.decodeMessage(eventObj as IMessageReceivedEventObj|ISecretTestEventObj, originEvent);
    }
  }

  private decodeMessageSent(eventObj: IMessageSentEventObj): MessageSentEvent {
    return new MessageSentEvent(
      eventObj.message_id,
      new Date(eventObj.message_date),
    );
  }

  private decodeMessage(
    eventObj: IMessageReceivedEventObj|ISecretTestEventObj,
    originEvent?: IChatEvent,
  ): MessageEvent|IChatEvent {
    try {
      return this.mSuperSecretMessageDecoder.decodeEvent(eventObj as ISecretTestEventObj, originEvent);
    } catch (error) {
      const messageObj: IMessageReceivedEventObj = eventObj as IMessageReceivedEventObj;
      const messageType: "chat" | string = messageObj.message_type as "chat" | string;
      return new MessageEvent(
        messageObj.ID,
        messageObj.from,
        messageObj.to,
        messageObj.message,
        messageType,
        this.mDateProvider.getDate(messageObj.timestampSent),
        this.mDateProvider.getNow(),
      );
    }
  }
}

export interface IMessageSentEventObj extends ISoapEventObject {
  message_id: string;
  message_date: number;
}

export interface IMessageReceivedEventObj extends ISoapEventObject {
  message_type: string;
  ID: string;
  from: string;
  to: string;
  message: string;
  timestampSent: number;
}
