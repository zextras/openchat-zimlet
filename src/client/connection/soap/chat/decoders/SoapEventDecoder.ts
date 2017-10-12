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

import {LogEngine} from "../../../../../lib/log/LogEngine";
import {Logger} from "../../../../../lib/log/Logger";
import {ChatEvent} from "../../../../events/ChatEvent";

export abstract class SoapEventDecoder {

  public Log: Logger;
  private mEventCode: number;

  constructor(eventCode: number) {
    this.mEventCode = eventCode;
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
  }

  public getEventCode(): number {
    return this.mEventCode;
  }

  public abstract decodeEvent(eventObj: {[key: string]: any}, originEvent?: ChatEvent): ChatEvent;
}
