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
import {ChatClient} from "../../ChatClient";
import {ZmFolder} from "../../../zimbra/zimbraMail/share/model/ZmFolder";
import {ZmApp} from "../../../zimbra/zimbraMail/core/ZmApp";
import {ChatFolderHandler} from "../../../dwt/ChatFolderHandler";
import {ChatEventHandler} from "./ChatEventHandler";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";

export class EventSessionRegisteredHistoryEnabledHandler implements ChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.REGISTER_SESSION;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    // client.getSessionInfoProvider().setHistoryEnabled((<EventSessionRegistered> chatEvent).getInfo("history_enabled"));
    let chatFolderHandler = new ChatFolderHandler(
      ZmFolder.ID_CHATS,
      ZmFolder.HIDE_ID,
      [ZmApp.MAIL, ZmApp.PORTAL]
    );
    chatFolderHandler.setVisible(true);
    return true;
  }

}
