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

import {Message} from "./Message";
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {Callback} from "../lib/callbacks/Callback";

export class MessageSent extends Message {

  private mDestination: string;
  private mDelivered: boolean;
  private mOnDeliveredChangeCallbacks: CallbackManager;

  constructor(id: string = "", destinationId: string, date: Date, message: string = "") {
    super(id, date, message);
    this.mDestination = destinationId;
    this.mDelivered = false;
    this.mOnDeliveredChangeCallbacks = new CallbackManager();
  }

  public getDestination(): string {
    return this.mDestination;
  }

  public setDelivered(): void {
    this.mDelivered = true;
    this.mOnDeliveredChangeCallbacks.run(this.mDelivered);
  }

  public isDelivered(): boolean {
    return this.mDelivered;
  }

  public onSetDelivered(callback: Callback): void {
    this.mOnDeliveredChangeCallbacks.addCallback(callback);
  }

}