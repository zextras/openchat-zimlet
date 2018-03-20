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

import {IOpenChatUserCapabilities} from "../../client/events/chat/IOpenChatUserCapabilities";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {UserCapabilitiesEvent} from "../../client/events/chat/UserCapabilitiesEvent";
import {IChatEventHandler} from "../../client/events/handlers/IChatEventHandler";
import {IChatClient} from "../../client/IChatClient";
import {IUserCapabilitesAction} from "../action/IUserCapabilitesAction";
import {IOpenChatState} from "../IOpenChatState";

export class UserCapabilitiesReduxEventHandler<T extends IOpenChatUserCapabilities>
  implements IChatEventHandler<UserCapabilitiesEvent<T>> {

  private mStore: Store<IOpenChatState>;

  constructor(store: Store<IOpenChatState>) {
    this.mStore = store;
  }

  public getEventCode(): number {
    return OpenChatEventCode.USER_CAPABILITIES;
  }

  public handleEvent(ev: UserCapabilitiesEvent<T>, client: IChatClient): boolean {
    this.mStore.dispatch<IUserCapabilitesAction<T>>({
      buddyJid: ev.getSender(),
      capabilities: ev.getCapabilities(),
      type: "SET_USER_CAPABILITIES",
    });
    return true;
  }

}
