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

import {IdGenerator} from "../../../dwt/IdGenerator";
import {StringUtils} from "../../../lib/StringUtils";
import {DwtDialog} from "../../../zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtMessageDialog} from "../../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {appCtxt} from "../../../zimbra/zimbraMail/appCtxt";
import {IChatClient} from "../../IChatClient";
import {BroadcastMessageEvent} from "../chat/BroadcastMessageEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {ChatEvent} from "../ChatEvent";
import {IChatEventHandler} from "./IChatEventHandler";

export class BroadcastMessageEventHandler implements IChatEventHandler {

  public getEventCode(): number {
    return OpenChatEventCode.BROADCAST_MESSAGE;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const broadcastMessageEvent: BroadcastMessageEvent = chatEvent as BroadcastMessageEvent;
    client.Log.warn(broadcastMessageEvent, "Received broadcast message.");
    const msgDialog: DwtMessageDialog = new DwtMessageDialog({
      buttons: [DwtDialog.DISMISS_BUTTON],
      id: IdGenerator.generateId("ZxChat_BroadcastMessageDialog"),
      parent: appCtxt.getShell(),
    });
    msgDialog.setMessage(
      StringUtils.getMessage("bmsg_from", [
        broadcastMessageEvent.getSender(),
        broadcastMessageEvent.getMessage(),
      ]),
    );
    msgDialog.popup();
    return true;
  }
}
