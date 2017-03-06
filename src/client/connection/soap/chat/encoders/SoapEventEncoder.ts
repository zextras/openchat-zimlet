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

import {ChatEvent} from "../../../../events/ChatEvent";

export abstract class SoapEventEncoder {

  protected mEventCode: number;

  constructor(eventCode: number) {
    this.mEventCode = eventCode;
  }

  public getEventCode(): number {
    return this.mEventCode;
  }

  protected abstract getEventDetails(event: ChatEvent): {[key: string]: any};

  public encodeEvent(event: ChatEvent): {[key: string]: any} {
    let details: {[key: string]: any} = this.getEventDetails(event),
      obj: {[key: string]: any} = {
        type: event.getCode()
      };
    for (let key in details) {
      if (!details.hasOwnProperty(key)) continue;
      obj[key] = details[key];
    }
    return obj;
  }
}
