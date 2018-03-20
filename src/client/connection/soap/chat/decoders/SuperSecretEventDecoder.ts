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
import {JSON3 as JSON} from "../../../../../libext/json3";
import {SuperSecretEvent} from "../../../../events/chat/SuperSecretEvent";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class SuperSecretEventDecoder extends SoapEventDecoder<IChatEvent> {

  private mDateProvider: IDateProvider;
  private mDecoders: {[eventId: string]: SoapEventDecoder<IChatEvent>} = {};

  constructor(dateProvider: IDateProvider) {
    super(SuperSecretEvent.ID);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: ISuperSecretEventObj, originEvent?: IChatEvent): IChatEvent {
    const internalEvent = JSON.parse(eventObj.message);
    let eventCode: number;
    if (typeof internalEvent.type === "number") {
      eventCode = internalEvent.type;
    } else {
      eventCode = parseInt(internalEvent.type, 10);
    }
    if (!this.mDecoders.hasOwnProperty(`${eventCode}`)) {
      throw new Error("Unable to find decoder for event " + eventCode + ".");
    }
    const decoded: SuperSecretEvent = this.mDecoders[`${eventCode}`].decodeEvent(
      internalEvent,
      originEvent,
    ) as SuperSecretEvent;
    decoded.setMessageId(eventObj.ID);
    decoded.setCode(eventCode);
    return decoded;
  }

  public addDecoder(decoder: SoapEventDecoder<IChatEvent>): void {
    if (this.mDecoders.hasOwnProperty(`${decoder.getEventCode()}`)) {
      throw new Error("Decoder for event '" + decoder.getEventCode() + "' already registered.");
    }
    this.mDecoders[`${decoder.getEventCode()}`] = decoder;
  }

}

interface ISuperSecretEventObj extends ISoapEventObject {
  message: string;
  ID: string;
}
