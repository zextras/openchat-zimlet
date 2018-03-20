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

import {IOpenChatSessionInfo, IOpenChatState} from "../../../redux/IOpenChatState";
import {IChatClient} from "../../IChatClient";
import {ContactInformationEvent} from "../chat/ContactInformationEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {IChatEventHandler} from "./IChatEventHandler";

export class ContactInformationEventHandler implements IChatEventHandler<ContactInformationEvent> {

  private mStore: Store<IOpenChatState>;

  constructor(store: Store<IOpenChatState>) {
    this.mStore = store;
  }

  public getEventCode(): number {
    return OpenChatEventCode.CONTACT_INFORMATION;
  }

  public handleEvent(ev: ContactInformationEvent, client: IChatClient): boolean {
    if (ev.getContactType().toLowerCase() === "chat") {
      const sessionInfo: IOpenChatSessionInfo = this.mStore.getState().sessionInfo;
      if (ev.getSenderWithResource() !== `${sessionInfo.username}/${sessionInfo.sessionId}`) {
        const buddy = client.getBuddyList().getBuddyById(ev.getSender());
        if (buddy != null) {
          buddy.setStatus(ev.getStatus(), ev.getSenderResource());
        }
      }
    }
    return true;
  }
}
