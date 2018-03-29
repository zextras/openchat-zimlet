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

import {Legacy2RoomAckEvent} from "../../../../../../events/chat/legacy/2/Legacy2RoomAckEvent";
import {OpenChatEventCode} from "../../../../../../events/chat/OpenChatEventCode";
import {SoapEventEncoder} from "../../SoapEventEncoder";

export class Legacy2MessageAckEventEncoder extends SoapEventEncoder<Legacy2RoomAckEvent> {

  constructor() {
    super(OpenChatEventCode.ROOM_ACK);
  }

  protected getEventDetails(ev: Legacy2RoomAckEvent): ILegacy2MessageAckEventObj {
    return {
      message_ids: ev.getMessageIds(),
      target_address: ev.getDestination(),
    };
  }

}

interface ILegacy2MessageAckEventObj {
  message_ids: string[];
  target_address: string;
}
