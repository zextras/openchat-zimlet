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

import {JSON3 as JSON} from "../../../libext/json3";
import {MessageEvent} from "./MessageEvent";

export class SuperSecretEvent extends MessageEvent {

  public static ID: number = -1;
  private mTypeSecret: number;
  private mObjData: {[key: string]: any};

  constructor(
    type: number,
    destination: string,
    creationDate: Date,
  ) {
    // noinspection TypeScriptValidateTypes
    super(
      "",
      undefined,
      destination,
      "{}",
      "chat",
      creationDate,
      creationDate,
    );
    this.mTypeSecret = type;
    this.mObjData = {};
  }

  public setMessageData(obj: {[key: string]: any}) {
    this.mObjData = obj;
  }

  public getMessageData(): {[key: string]: any} {
    return this.mObjData;
  }

  public getMessage(): string {
    this.mObjData.type = this.mTypeSecret;
    this.mObjData.from = this.getSenderWithResource();
    this.mObjData.to = this.getDestinationWithResource();
    this.mObjData.timestampSent = this.getDate().getTime();
    return JSON.stringify(this.mObjData, null, 2);
  }

}
