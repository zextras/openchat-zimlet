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

import {IBasicEvent} from "./IBasicEvent";

export class BasicEvent implements IBasicEvent {

  private mData: any = undefined;
  private mHasResponse: boolean;
  private mCode: number;

  constructor(code: number, hasResponse: boolean) {
    this.mCode = code;
    this.mHasResponse = hasResponse;
  }

  /**
   * Get the unique code associated to the event.
   */
  public getCode(): number {
    return this.mCode;
  }

  public setCode(eventCode: number): void {
    this.mCode = eventCode;
  }

  /**
   * Get if the request has an immediate response.
   */
  public hasResponse(): boolean {
    return this.mHasResponse;
  }

  public setData(data: any): void {
    this.mData = data;
  }

  public getData(): any {
    return this.mData;
  }

}
