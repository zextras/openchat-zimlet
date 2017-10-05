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

import {JSON3} from "../../../libext/json3";
import {MessageEvent, MessageType} from "./MessageEvent";

export class SuperSecretEvent extends MessageEvent {

  public static ID: number = -1;
  private mTypeSecret: number;

  constructor(
    type: number,
    sender: string,
    destination: string,
    creationDate: Date,
  ) {
    // noinspection TypeScriptValidateTypes
    super(
      "",
      sender,
      destination,
      "{}",
      MessageEvent.convertFromMessageType(MessageType.CHAT),
      creationDate,
      creationDate,
    );
    this.mTypeSecret = type;
  }

  public setMessageData(obj: any) {
    obj.type = this.mTypeSecret;
    obj.from = this.getSender();
    obj.to = this.getDestination();
    obj.timestampSent = this.getDate().getTime();
    this.mMessage = JSON3.stringify(obj, null, 2);
  }

}
