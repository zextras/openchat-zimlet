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
import {Version} from "../../../../../lib/Version";
import {NewClientVersionEvent} from "../../../../events/chat/NewClientVersionEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class NewClientVersionEventDecoder extends SoapEventDecoder<NewClientVersionEvent> {
  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.NEW_CLIENT_VERSION);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: INewClientVersionEventObj, originEvent?: IChatEvent): NewClientVersionEvent {
    return new NewClientVersionEvent(
      new Version(eventObj.currentZimletVersion),
      this.mDateProvider.getNow(),
    );
  }

}

interface INewClientVersionEventObj extends ISoapEventObject {
  currentZimletVersion: string;
}
