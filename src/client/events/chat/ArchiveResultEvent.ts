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

import {ChatEvent} from "../ChatEvent";
import {IChatEvent} from "../IChatEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class ArchiveResultEvent<T extends IChatEvent> extends ChatEvent {

  private mOriginalEvent: T;
  private mQueryId: string;

  constructor(
    from: string,
    to: string,
    queryId: string,
    originalEv: T,
    date: Date,
  ) {
    super(OpenChatEventCode.ARCHIVE_RESULT, date, false);
    this.setSender(from);
    this.setDestination(to);
    this.mOriginalEvent = originalEv;
    if (
      typeof this.mOriginalEvent.getDestination() === "undefined"
      || this.mOriginalEvent.getSender() === this.mOriginalEvent.getDestination()
    ) {
      this.mOriginalEvent.setDestination(to);
    }
    this.mQueryId = queryId;
  }

  public getOriginalEvent(): T {
    return this.mOriginalEvent;
  }

  public getQueryId(): string {
    return this.mQueryId;
  }

}
