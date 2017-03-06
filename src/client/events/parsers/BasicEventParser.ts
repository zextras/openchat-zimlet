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

import {ConnectionEventParser} from "./ConnectionEventParser";
import {BasicEvent} from "../BasicEvent";

export class BasicEventParser implements ConnectionEventParser {

  public encodeEvent(connectionEvent: BasicEvent): {} {
    return {
      code: connectionEvent.getCode(),
      data: connectionEvent.getData()
    };
  }

  public decodeEvent(originEvent: BasicEvent, object: {code?: number}): BasicEvent {
    let code = (typeof object["code"] !== "undefined") ? object["code"] : -1;
    let event = new BasicEvent(code, false);
    event.setData(object);
    return event;
  }

}
