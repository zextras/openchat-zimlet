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

import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {RegisterSessionEvent} from "../../../../events/chat/RegisterSessionEvent";
import {ChatEvent} from "../../../../events/ChatEvent";
import {SoapEventEncoder} from "./SoapEventEncoder";

export class RegisterSessionEventEncoder extends SoapEventEncoder {

  constructor() {
    super(OpenChatEventCode.REGISTER_SESSION);
  }

  protected getEventDetails(event: ChatEvent): {} {
    const ev: RegisterSessionEvent = event as RegisterSessionEvent;
    return {
      clientVersion: ev.getClientVersion().toString(),
    };
  }

}
