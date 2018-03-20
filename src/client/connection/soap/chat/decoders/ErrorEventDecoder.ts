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

import {ZxError} from "../../../../../lib/error/ZxError";
import {IDateProvider} from "../../../../../lib/IDateProvider";
import {ErrorEvent} from "../../../../events/chat/ErrorEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class ErrorEventDecoder extends SoapEventDecoder<ErrorEvent> {
  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.ERROR);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: ISoapEventObject, originEvent?: IChatEvent): ErrorEvent {
    return new ErrorEvent(
      ZxError.fromResponse({ error: eventObj }),
      this.mDateProvider.getNow(),
    );
  }

}
