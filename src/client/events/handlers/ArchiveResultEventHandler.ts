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
import {ArchiveResultEvent} from "../chat/ArchiveResultEvent";
import {OpenChatEventCode} from "../chat/OpenChatEventCode";
import {IChatEvent} from "../IChatEvent";
import {IEventManager} from "../IEventManager";
import {IChatEventHandler} from "./IChatEventHandler";

export class ArchiveResultEventHandler implements IChatEventHandler<ArchiveResultEvent<IChatEvent>> {

  private mEventManager: IEventManager;

  constructor(eventManager: IEventManager) {
    this.mEventManager = eventManager;
  }

  public getEventCode(): number {
    return OpenChatEventCode.ARCHIVE_RESULT;
  }

  public handleEvent(ev: ArchiveResultEvent<IChatEvent>, client: IChatClient): boolean {
    return this.mEventManager.handleEvent(
      ev.getOriginalEvent(),
      client,
    );
  }

}
