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

import {IUserCapabilities} from "../../connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {IBuddy} from "../../IBuddy";
import {ChatEvent} from "../ChatEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class FriendBackAddedEvent<T extends IUserCapabilities> extends ChatEvent {

  private mBuddy: IBuddy;
  private mCapabilities: T;

  constructor(buddy: IBuddy, capabilities: T, creationDate: Date) {
    super(OpenChatEventCode.FRIEND_BACK_ADDED, creationDate, false);
    this.mBuddy = buddy;
    this.mCapabilities = capabilities;
  }

  public getBuddy(): IBuddy {
    return this.mBuddy;
  }

  public getCapabilities(): T {
    return this.mCapabilities;
  }
}
