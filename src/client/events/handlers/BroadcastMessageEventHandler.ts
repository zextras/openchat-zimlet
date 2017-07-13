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
import {BroadcastMessageEvent} from "../chat/BroadcastMessageEvent";
import {ChatEventHandler} from "./ChatEventHandler";
import {ChatClient} from "../../ChatClient";
import {DwtMessageDialog} from "../../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {DwtDialog} from "../../../zimbra/ajax/dwt/widgets/DwtDialog";
import {IdGenerator} from "../../../dwt/IdGenerator";
import {StringUtils} from "../../../lib/StringUtils";
import {appCtxt} from "../../../zimbra/zimbraMail/appCtxt";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";

export class BroadcastMessageEventHandler implements ChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.BROADCAST_MESSAGE;
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let broadcastMessageEvent: BroadcastMessageEvent = <BroadcastMessageEvent> chatEvent;
    client.Log.warn(broadcastMessageEvent, "Received broadcast message.");
    let msgDialog: DwtMessageDialog = new DwtMessageDialog({
      buttons: [DwtDialog.DISMISS_BUTTON],
      parent: appCtxt.getShell(),
      id: IdGenerator.generateId("ZxChat_BroadcastMessageDialog")
    });
    msgDialog.setMessage(
      "<b>" +
      StringUtils.getMessage("bmsg_from") +
      " " +
      (broadcastMessageEvent.getSender()) +
      ":</b><br/>" +
      (broadcastMessageEvent.getMessage())
    );
    msgDialog.popup();
    return true;
  }
}
