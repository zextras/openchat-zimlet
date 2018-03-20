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

import {IChatEvent} from "../../../events/IChatEvent";
import {IChatEventParser} from "../../../events/parsers/IChatEventParser";
import {SoapEventDecoder} from "./decoders/SoapEventDecoder";
import {SoapEventEncoder} from "./encoders/SoapEventEncoder";

export class SoapEventParser implements IChatEventParser<IChatEvent> {

  private mEncoders: {[id: string]: SoapEventEncoder<IChatEvent>} = {};
  private mDecoders: {[id: string]: SoapEventDecoder<IChatEvent>} = {};

  public addEncoder(encoder: SoapEventEncoder<IChatEvent>): void {
    if (this.mEncoders.hasOwnProperty(`${encoder.getEventCode()}`)) {
      throw new Error("Encoder for event '" + encoder.getEventCode() + "' already registered.");
    }
    this.mEncoders[`${encoder.getEventCode()}`] = encoder;
  }

  public addDecoder(decoder: SoapEventDecoder<IChatEvent>): void {
    if (this.mDecoders.hasOwnProperty(`${decoder.getEventCode()}`)) {
      throw new Error("Decoder for event '" + decoder.getEventCode() + "' already registered.");
    }
    this.mDecoders[`${decoder.getEventCode()}`] = decoder;
  }

  public encodeEvent(chatEvent: IChatEvent): {} {
    if (!this.mEncoders.hasOwnProperty(`${chatEvent.getCode()}`)) {
      throw new Error("Unable to find encoder for event " + chatEvent.getCode() + ".");
    }
    return this.mEncoders[`${chatEvent.getCode()}`].encodeEvent(chatEvent);
  }

  public decodeEvent(originEvent: IChatEvent, object: ISoapEventObject): IChatEvent {
    let eventCode: number;
    if (typeof object !== "undefined" && typeof object.type !== "undefined") {
      if (typeof object.type === "number") {
        eventCode = object.type;
      } else {
        eventCode = parseInt(object.type, 10);
      }
    } else {
      eventCode = originEvent.getCode();
    }
    if (!this.mDecoders.hasOwnProperty(`${eventCode}`)) {
      throw new Error("Unable to find decoder for event " + eventCode + ".");
    }
    return this.mDecoders[`${eventCode}`].decodeEvent(object, originEvent);
  }
}

export interface ISoapEventObject {
  type: number|string;
}
