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

import {ChatEventHandler} from "./ChatEventHandler";
import {ChatEvent} from "../ChatEvent";
import {ChatClient} from "../../ChatClient";
import {Buddy} from "../../Buddy";
import {MessageReceived} from "../../MessageReceived";
import {SuperSecretEvent} from "../chat/SuperSecretEvent";

export class SuperSecretEventHandler implements ChatEventHandler {

  getEventCode(): number {
    return SuperSecretEvent.ID;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let superSecretEvent: SuperSecretEvent = <SuperSecretEvent> chatEvent;
    let origin: string = superSecretEvent.getSender();
    let originBuddy: Buddy = client.getBuddyList().getBuddyById(origin);
    let messageReceived: MessageReceived = new MessageReceived(
      superSecretEvent.getMessageId(),
      originBuddy,
      superSecretEvent.getDate(),
      superSecretEvent.getMessage()
    );
    client.notifyMessageReceived(messageReceived);
    client.Log.debug(event, "Received SecretTestEvent");
    return true;
  }
}
