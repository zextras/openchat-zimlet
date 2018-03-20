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

import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {UnregisterSessionEvent} from "../../client/events/chat/UnregisterSessionEvent";
import {IChatClient} from "../../client/IChatClient";
import {IResetSessionInfoAction} from "../action/IResetSessionInfoAction";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class UnregisterSessionReduxEventHandler extends ReduxEventHandler<UnregisterSessionEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.UNREGISTER_SESSION;
  }

  public handleEvent(ev: UnregisterSessionEvent, client: IChatClient): boolean {
    this.mStore.dispatch<IResetSessionInfoAction>({type: "RESET_SESSION_INFO"});
    return true;
  }
}
