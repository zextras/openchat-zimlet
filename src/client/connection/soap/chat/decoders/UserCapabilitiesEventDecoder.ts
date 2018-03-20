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
import {IOpenChatUserCapabilities} from "../../../../events/chat/IOpenChatUserCapabilities";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {UserCapabilitiesEvent} from "../../../../events/chat/UserCapabilitiesEvent";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class UserCapabilitiesEventDecoder<T extends IOpenChatUserCapabilities>
  extends SoapEventDecoder<UserCapabilitiesEvent<T>> {

  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.USER_CAPABILITIES);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: IUserCapabilitiesEventObj<T>, originEvent?: IChatEvent): UserCapabilitiesEvent<T> {
    return new UserCapabilitiesEvent<T>(
      this.mDateProvider.getNow(),
      eventObj.from,
      eventObj.capabilities,
    );
  }

}

interface IUserCapabilitiesEventObj<T extends IOpenChatUserCapabilities>
  extends ISoapEventObject {

  from: string;
  capabilities: TOptCapapabilities<T>;

}

export type TOptCapapabilities<T extends IOpenChatUserCapabilities> = {
  [P in keyof T]?: T[P];
};
