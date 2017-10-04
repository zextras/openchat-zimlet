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

import {DateProvider} from "../../../../../lib/DateProvider";
import {JSON3} from "../../../../../libext/json3";
import {SuperSecretEvent} from "../../../../events/chat/SuperSecretEvent";
import {ChatEvent} from "../../../../events/ChatEvent";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class SuperSecretEventDecoder extends SoapEventDecoder {

  private mDateProvider: DateProvider;
  private mDecoders: {[eventId: string]: SoapEventDecoder} = {};

  constructor(dateProvider: DateProvider) {
    super(SuperSecretEvent.ID);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(eventObj: {[p: string]: any}, originEvent?: ChatEvent): ChatEvent {
    const internalEvent = JSON3.parse(eventObj.message);
    let eventCode: number;
    if (typeof internalEvent.type === "number") {
      eventCode = internalEvent.type;
    } else {
      eventCode = parseInt(internalEvent.type, 10);
    }
    if (!this.mDecoders.hasOwnProperty(`${eventCode}`)) {
      throw new Error("Unable to find decoder for event " + eventCode + ".");
    }
    const decoded: SuperSecretEvent = this.mDecoders[`${eventCode}`].decodeEvent(internalEvent, originEvent) as SuperSecretEvent;
    decoded.setMessageId(eventObj.ID);
    decoded.setCode(eventCode);
    return decoded;
  }

  public addDecoder(decoder: SoapEventDecoder): void {
    if (this.mDecoders.hasOwnProperty(`${decoder.getEventCode()}`)) {
      throw new Error("Decoder for event '" + decoder.getEventCode() + "' already registered.");
    }
    this.mDecoders[`${decoder.getEventCode()}`] = decoder;
  }

}
