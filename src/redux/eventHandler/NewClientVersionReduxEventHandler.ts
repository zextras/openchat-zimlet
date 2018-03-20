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

import {NewClientVersionEvent} from "../../client/events/chat/NewClientVersionEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {Version} from "../../lib/Version";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class NewClientVersionReduxEventHandler extends ReduxEventHandler<NewClientVersionEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.NEW_CLIENT_VERSION;
  }

  public handleEvent(ev: NewClientVersionEvent, client: IChatClient): boolean {
    const version: Version = ev.getNewClientVersion();
    // if (ZimletVersion.TESTING) {
    //   return true;
    // }
    // if (!ChatZimletBase.getVersion().equals(version) && !this.mUpdateNotified) {
    //   this.mUpdateNotified = true;
    //   const dialog: DwtMessageDialog = new DwtMessageDialog({
    //     buttons: [DwtDialog.YES_BUTTON, DwtDialog.DISMISS_BUTTON],
    //     id: IdGenerator.generateId("ZxChat_NewClientMessageDialog"),
    //     parent: appCtxt.getShell(),
    //   });
    //   let message: string = ZmMsg.zimletChangeRestart;
    //   if (version.equals(new Version(0, 0, 0))) {
    //     message = ZmMsg.zimletUndeploySuccess;
    //   }
    //   dialog.setMessage(
    //     message,
    //     DwtMessageDialog.INFO_STYLE,
    //     "Chat Zimlet",
    //   );
    //   dialog.setButtonListener(
    //     DwtDialog.YES_BUTTON,
    //     new AjxListener(
    //       location,
    //       location.reload,
    //     ),
    //   );
    //   dialog.popup();
    // }
    return true;
  }
}
