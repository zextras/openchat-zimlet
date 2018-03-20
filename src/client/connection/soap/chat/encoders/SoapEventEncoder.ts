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

import {IChatEvent} from "../../../../events/IChatEvent";

export abstract class SoapEventEncoder<T extends IChatEvent> {

  protected mEventCode: number;

  constructor(eventCode: number) {
    this.mEventCode = eventCode;
  }

  public getEventCode(): number {
    return this.mEventCode;
  }

  public encodeEvent(ev: T): {[key: string]: any} {
    const details: {[key: string]: any} = this.getEventDetails(ev);
    const obj: {[key: string]: any} = {
        type: ev.getCode(),
      };
    for (const key in details) {
      if (!details.hasOwnProperty(key)) { continue; }
      obj[key] = details[key];
    }
    return obj;
  }

  protected abstract getEventDetails(ev: T): {[key: string]: any};
}
