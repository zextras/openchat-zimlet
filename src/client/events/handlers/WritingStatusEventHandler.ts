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

import {ChatEvent} from "../ChatEvent";
import {WritingStatusEvent} from "../chat/WritingStatusEvent";
import {Room} from "../../Room";
import {MessageWritingStatus} from "../../MessageWritingStatus";
import {ChatEventHandler} from "./ChatEventHandler";
import {ChatClient} from "../../ChatClient";

export class WritingStatusEventHandler implements ChatEventHandler {

  public getEventCode(): number {
    return WritingStatusEvent.ID;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let writingStatusEvent: WritingStatusEvent = <WritingStatusEvent> chatEvent;
    if (writingStatusEvent.getSender() !== client.getSessionInfoProvider().getUsername()) {
      let originRoom: Room = client.getRoomManager().getRoomById(writingStatusEvent.getSender());
      if (originRoom != null) {
        originRoom.addWritingStatusEvent(
          new MessageWritingStatus(
            client.getBuddyList().getBuddyById(writingStatusEvent.getSender()),
            client.getDateProvider().getNow(),
            writingStatusEvent.getValue()
          )
        );
      }
    }
    return true;
  }
}
