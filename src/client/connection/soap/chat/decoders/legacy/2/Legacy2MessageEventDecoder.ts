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

import {MessageEvent} from "../../../../../../events/chat/MessageEvent";
import {MessageSentEvent} from "../../../../../../events/chat/MessageSentEvent";
import {IChatEvent} from "../../../../../../events/IChatEvent";
import {IMessageReceivedEventObj, IMessageSentEventObj, MessageEventDecoder} from "../../MessageEventDecoder";
import {ISecretTestEventObj} from "../../SecretTestEventDecoder";

export class Legacy2MessageEventDecoder extends MessageEventDecoder {

  public decodeEvent(
    eventObj: IMessageReceivedEventObj|IMessageSentEventObj|ISecretTestEventObj,
    originEvent?: IChatEvent,
  ): MessageEvent|MessageSentEvent|IChatEvent {
    (eventObj as IMessageReceivedEventObj).message_type = "Chat";
    return super.decodeEvent(eventObj, originEvent);
  }

}
