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

import {IDateProvider} from "../../../../../lib/IDateProvider";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {RequiredRegistrationEvent} from "../../../../events/chat/RequiredRegistrationEvent";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class RequiredRegistrationEventDecoder extends SoapEventDecoder<RequiredRegistrationEvent> {
  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.REQUIRED_REGISTRATION);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: ISoapEventObject, originEvent?: IChatEvent): RequiredRegistrationEvent {
    return new RequiredRegistrationEvent(this.mDateProvider.getNow());
  }

}
