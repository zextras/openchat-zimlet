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
import {WritingStatusEvent} from "../../client/events/chat/WritingStatusEvent";
import {IChatClient} from "../../client/IChatClient";
import {IRoomAction} from "../action/IRoomAction";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class WritingStatusReduxEventHandler extends ReduxEventHandler<WritingStatusEvent> {
  public getEventCode(): number {
    return OpenChatEventCode.WRITING_STATUS;
  }

  public handleEvent(ev: WritingStatusEvent, client: IChatClient): boolean {
    this.mStore.dispatch<IRoomAction>({
      jid: ev.getSender(),
      type: "SET_WRITING_STATUS",
      writingStatus: WritingStatusEvent.fromTypeToString(ev.getValue()),
    });
    return true;
  }
}
