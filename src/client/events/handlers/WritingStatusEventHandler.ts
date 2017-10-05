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

import {IChatClient} from "../../IChatClient";
import {IRoom} from "../../IRoom";
import {MessageWritingStatus} from "../../MessageWritingStatus";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {WritingStatusEvent} from "../chat/WritingStatusEvent";
import {ChatEvent} from "../ChatEvent";
import {IChatEventHandler} from "./IChatEventHandler";

export class WritingStatusEventHandler implements IChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.WRITING_STATUS;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const writingStatusEvent: WritingStatusEvent = chatEvent as WritingStatusEvent;
    if (writingStatusEvent.getSender() !== client.getSessionInfoProvider().getUsername()) {
      const originRoom: IRoom = client.getRoomManager().getRoomById(writingStatusEvent.getSender());
      if (originRoom != null) {
        originRoom.addWritingStatusEvent(
          new MessageWritingStatus(
            client.getBuddyList().getBuddyById(writingStatusEvent.getSender()),
            client.getDateProvider().getNow(),
            writingStatusEvent.getValue(),
          ),
        );
      }
    }
    return true;
  }
}
