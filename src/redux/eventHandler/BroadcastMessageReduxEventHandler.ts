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

import {BroadcastMessageEvent} from "../../client/events/chat/BroadcastMessageEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class BroadcastMessageReduxEventHandler extends ReduxEventHandler<BroadcastMessageEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.BROADCAST_MESSAGE;
  }

  public handleEvent(ev: BroadcastMessageEvent, client: IChatClient): boolean {
    // client.Log.warn(broadcastMessageEvent, "Received broadcast message.");
    // const msgDialog: DwtMessageDialog = new DwtMessageDialog({
    //   buttons: [DwtDialog.DISMISS_BUTTON],
    //   id: IdGenerator.generateId("ZxChat_BroadcastMessageDialog"),
    //   parent: appCtxt.getShell(),
    // });
    // msgDialog.setMessage(
    //   StringUtils.getMessage("bmsg_from", [
    //     broadcastMessageEvent.getSender(),
    //     broadcastMessageEvent.getMessage(),
    //   ]),
    // );
    // msgDialog.popup();
    return true;
  }
}
