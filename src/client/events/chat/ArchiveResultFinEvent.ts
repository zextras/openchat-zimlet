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
import {OpenChatEventCode} from "./OpenChatEventCode";

export class ArchiveResultFinEvent extends ChatEvent {
  private mQueryId: string;
  private mFirst: string;
  private mLast: string;
  private mFirstIdx: number;
  private mCount: number;

  constructor(
    from: string,
    queryId: string,
    first: string,
    last: string,
    firstIdx: number,
    count: number,
    date: Date,
  ) {
    super(OpenChatEventCode.ARCHIVE_RESULT_FIN, date, false);
    this.setSender(from);
    this.mQueryId = queryId;
    this.mFirst = first;
    this.mLast = last;
    this.mFirstIdx = firstIdx;
    this.mCount = count;
  }

  public getQueryId(): string {
    return this.mQueryId;
  }

  public getFirst(): string {
    return this.mFirst;
  }

  public getLast(): string {
    return this.mLast;
  }

  public getFirstIdx(): number {
    return this.mFirstIdx;
  }

  public getCount(): number {
    return this.mCount;
  }
}
