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

import {Store} from "redux";

import {IOpenChatState} from "../../../redux/IOpenChatState";
import {IChatClient} from "../../IChatClient";
import {MessageEvent} from "../chat/MessageEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {IChatEventHandler} from "./IChatEventHandler";

export class MessageEventHandler implements IChatEventHandler<MessageEvent> {

  private mStore: Store<IOpenChatState>;

  constructor(store: Store<IOpenChatState>) {
    this.mStore = store;
  }

  public getEventCode(): number {
    return OpenChatEventCode.MESSAGE;
  }

  public handleEvent(ev: MessageEvent, client: IChatClient): boolean {
    if (ev.getType().toLowerCase() === "chat" && ev.getSender() !== this.mStore.getState().sessionInfo.username) {
      client.receivedMessage(ev.getSender(), ev.getSender(), ev.getMessage());
    }
    return true;
  }
}
