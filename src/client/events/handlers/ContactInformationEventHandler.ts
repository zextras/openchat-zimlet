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
import {ContactInformationEvent} from "../chat/ContactInformationEvent";
import {MessageType} from "../chat/MessageEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {ChatEvent} from "../ChatEvent";
import {IChatEventHandler} from "./IChatEventHandler";

export class ContactInformationEventHandler implements IChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.CONTACT_INFORMATION;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const contactEvent: ContactInformationEvent = chatEvent as ContactInformationEvent;
    if (contactEvent.getContactType() === MessageType.CHAT) {
      if (contactEvent.getSenderWithResource() === client.getSessionInfoProvider().getUsernameWithResource()) {
        client.statusChanged(contactEvent.getStatus());
      } else {
        const buddy = client.getBuddyList().getBuddyById(contactEvent.getSender());
        if (buddy != null) {
          buddy.setStatus(contactEvent.getStatus(), contactEvent.getSenderResource());
        }
      }
    }
    return true;
  }
}
