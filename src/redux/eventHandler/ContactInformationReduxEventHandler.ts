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

import {ContactInformationEvent} from "../../client/events/chat/ContactInformationEvent";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {IBuddyAction} from "../action/IBuddyAction";
import {IUserStatusAction} from "../action/IUserStatusAction";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class ContactInformationReduxEventHandler extends ReduxEventHandler<ContactInformationEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.CONTACT_INFORMATION;
  }

  public handleEvent(ev: ContactInformationEvent, client: IChatClient): boolean {
    if (ev.getContactType().toLowerCase() === "chat") {
      const currentUser: string =
        `${this.mStore.getState().sessionInfo.username}/${this.mStore.getState().sessionInfo.sessionId}`;
      if (ev.getSenderWithResource() !== currentUser) {
        this.mStore.dispatch<IBuddyAction>(
          {
            buddyJid: ev.getSender(),
            status: {
              message: "",
              resource: ev.getSenderResource(),
              type: ev.getStatus().getType(),
            },
            type: "ADD_OR_UPDATE_STATUS_TO_BUDDY",
          },
        );
      } else {
        this.mStore.dispatch<IUserStatusAction>({
          statusType: ev.getStatus().getType(),
          type: "SET_USER_STATUS",
        });
      }
    }

    return true;
  }
}
