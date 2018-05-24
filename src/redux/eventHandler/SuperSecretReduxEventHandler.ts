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

import {SuperSecretEvent} from "../../client/events/chat/SuperSecretEvent";
import {IChatClient} from "../../client/IChatClient";
import {IAddMessageToRoomAction} from "../action/IAddMessageToRoomAction";
import {IOpenChatTextMessage} from "../IOpenChatState";
import {OpenChatTextMessageInitialState} from "../OpenChatInitialState";
import {ReduxEventHandler} from "./ReduxEventHandler";

/**
 * @deprecated
 */
export class SuperSecretReduxEventHandler extends ReduxEventHandler<SuperSecretEvent> {
  public getEventCode(): number {
    return SuperSecretEvent.ID;
  }

  public handleEvent(ev: SuperSecretEvent, client: IChatClient): boolean {
    const message: IOpenChatTextMessage = {
      ...OpenChatTextMessageInitialState,
      content: ev.getMessage(),
      date: ev.getDate(),
      destination: ev.getDestination(),
      id: ev.getMessageId(),
      sender: ev.getSender(),
    };
    this.mStore.dispatch<IAddMessageToRoomAction<IOpenChatTextMessage>>({
      jid: ev.getSender(),
      message: message,
      type: "ADD_MESSAGE_TO_ROOM",
    });
    // client.notifyMessageReceived(messageReceived);
    // client.Log.debug(event, "Received SecretTestEvent");
    return true;
  }
}
