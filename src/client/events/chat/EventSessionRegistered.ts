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

import {Version} from "../../../lib/Version";
import {
  ISessionRegisteredEventObj,
  IUserCapabilities,
} from "../../connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {ChatEvent} from "../ChatEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class EventSessionRegistered<T extends IUserCapabilities> extends ChatEvent {

  protected mEventSessionInfo: ISessionRegisteredEventObj<T>;

  constructor(eventSessionInfo: ISessionRegisteredEventObj<T>, creationDate: Date) {
    super(OpenChatEventCode.REGISTER_SESSION, creationDate, true);
    this.mEventSessionInfo = eventSessionInfo;
  }

  public getInfo<S>(info: string): S {
    return this.mEventSessionInfo[info];
  }

  public getCapabilities(): T {
    if (this.mEventSessionInfo.hasOwnProperty("capabilities")) {
      return this.mEventSessionInfo.capabilities;
    } else {
      return {} as T;
    }
  }

  public getServerVersion(): Version {
    return new Version(this.getInfo<string>("server_version"));
  }

}
