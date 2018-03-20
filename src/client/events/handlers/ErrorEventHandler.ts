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

import {IChatClient} from "../../IChatClient";
import {ErrorEvent} from "../chat/ErrorEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {IChatEventHandler} from "./IChatEventHandler";

export class ErrorEventHandler implements IChatEventHandler<ErrorEvent> {

  public getEventCode(): number {
    return OpenChatEventCode.ERROR;
  }

  public handleEvent(ev: ErrorEvent, client: IChatClient): boolean {
    client.Log.err(ev.getError(), "Client error");
    return true;
  }
}
