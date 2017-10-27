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

import {ChatZimletBase} from "../../../ChatZimletBase";
import {IdGenerator} from "../../../dwt/IdGenerator";
import {Version} from "../../../lib/Version";
import {DwtDialog} from "../../../zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtMessageDialog} from "../../../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {appCtxt} from "../../../zimbra/zimbraMail/appCtxt";
import {ZmMsg} from "../../../zimbra/zimbraMail/ZmMsg";
import {ZimletVersion} from "../../../ZimletVersion";
import {IChatClient} from "../../IChatClient";
import {NewClientVersionEvent} from "../chat/NewClientVersionEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {ChatEvent} from "../ChatEvent";
import {IChatEventHandler} from "./IChatEventHandler";

export class NewClientVersionEventHandler implements IChatEventHandler {

  private mUpdateNotified: boolean;

  public getEventCode(): number {
    return OpenChatEventCode.NEW_CLIENT_VERSION;
  }

  public handleEvent(chatEvent: ChatEvent, client: IChatClient): boolean {
    const newClientVersionEvent: NewClientVersionEvent = chatEvent as NewClientVersionEvent;
    const version: Version = newClientVersionEvent.getNewClientVersion();
    if (ZimletVersion.TESTING) {
      return true;
    }
    if (!ChatZimletBase.getVersion().equals(version) && !this.mUpdateNotified) {
      this.mUpdateNotified = true;
      const dialog: DwtMessageDialog = new DwtMessageDialog({
        buttons: [DwtDialog.YES_BUTTON, DwtDialog.DISMISS_BUTTON],
        id: IdGenerator.generateId("ZxChat_NewClientMessageDialog"),
        parent: appCtxt.getShell(),
      });
      let message: string = ZmMsg.zimletChangeRestart;
      if (version.equals(new Version(0, 0, 0))) {
        message = ZmMsg.zimletUndeploySuccess;
      }
      dialog.setMessage(
        message,
        DwtMessageDialog.INFO_STYLE,
        "Chat Zimlet",
      );
      dialog.setButtonListener(
        DwtDialog.YES_BUTTON,
        new AjxListener(
          location,
          location.reload,
        ),
      );
      dialog.popup();
    }
    return true;
  }
}
