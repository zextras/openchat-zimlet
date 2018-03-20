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

import {IUserCapabilities} from "../../client/connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {EventSessionRegistered} from "../../client/events/chat/EventSessionRegistered";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class SessionRegisteredHistoryEnabledReduxEventHandler
  extends ReduxEventHandler<EventSessionRegistered<IUserCapabilities>> {
  public getEventCode(): number {
    return OpenChatEventCode.REGISTER_SESSION;
  }

  public handleEvent(ev: EventSessionRegistered<IUserCapabilities>, client: IChatClient): boolean {
    if (ev != null) {
      // let chatFolderHandler = new ChatFolderHandler(
      //   ZmFolder.ID_CHATS,
      //   ZmFolder.HIDE_ID,
      //   [ZmApp.MAIL, ZmApp.PORTAL]
      // );
      // chatFolderHandler.setVisible(true);
    }
    return true;
  }
}
