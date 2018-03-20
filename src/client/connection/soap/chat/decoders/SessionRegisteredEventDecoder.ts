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
import {EventSessionRegistered} from "../../../../events/chat/EventSessionRegistered";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class SessionRegisteredEventDecoder<T extends IUserCapabilities>
  extends SoapEventDecoder<EventSessionRegistered<T>> {

  protected mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.REGISTER_SESSION);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    eventObj: ISessionRegisteredEventObj<T>,
    originEvent?: IChatEvent,
  ): EventSessionRegistered<T> {
    return new EventSessionRegistered<T>(
      eventObj,
      this.mDateProvider.getNow(),
    );
  }

}

export interface ISessionRegisteredEventObj<T extends IUserCapabilities> extends ISoapEventObject {
  [key: string]: any;
  capabilities?: T;
}

export interface IUserCapabilities {
  [key: string]: any;
}
