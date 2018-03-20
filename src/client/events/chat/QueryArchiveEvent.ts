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

export class QueryArchiveEvent  extends ChatEvent {

  public static DEFAULT_MAX: number = 10;

  private mMax: number;
  private mBefore: string;
  private mAfter: string;
  private mStart: number;
  private mEnd: number;

  constructor(
    destination: string,
    max?: number,
    before?: string,
    after?: string,
    start?: number,
    end?: number,
  ) {
    super(OpenChatEventCode.QUERY_ARCHIVE, null, false);
    this.setDestination(destination);
    this.mMax = max;
    this.mBefore = before;
    this.mAfter = after;
    this.mStart = start;
    this.mEnd = end;
  }

  public getMax(): number {
    return this.mMax;
  }

  public getBefore(): string {
    return this.mBefore;
  }

  public getAfter(): string {
    return this.mAfter;
  }

  public getStart(): number {
    return this.mStart;
  }

  public getEnd(): number {
    return this.mEnd;
  }

}
