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

import {Connection} from "../Connection";
import {Callback} from "../../../lib/callbacks/Callback";
import {Request} from "../Request";
import {ZxError} from "../../../lib/error/ZxError";
import {LogEngine} from "../../../lib/log/LogEngine";
import {RequestFactory} from "../RequestFactory";
import {BasicEvent} from "../../events/BasicEvent";
import {DummyRequest} from "./DummyRequest";
import {Condition} from "../../../lib/Condition";

export class DummyConnection implements Connection {

  private Log = LogEngine.getLogger(LogEngine.CHAT);

  public  mRequestFactory: RequestFactory;
  private mRequestCount: number = 0;
  private mIsStreamOpened: boolean = false;
  private mOnStreamEventCbk: Callback;
  private mOnStreamErrorCbk: Callback;
  private mOnEndProcessResponsesCbk: Callback;
  private mSentObjects: {}[] = [];
  private mResponses: ResponseContainer[] = [];
  private mErrorResponses: ResponseContainer[] = [];

  constructor(
    requestFactory: RequestFactory
  ) {
    this.mRequestFactory = requestFactory;
  }

  public sendObject(
    command: string,
    object: {},
    callback: Callback,
    errorCallback: Callback
  ): Request {
    let request: DummyRequest = <DummyRequest>this.mRequestFactory.createRequest(
      (++this.mRequestCount),
      command,
      object,
      callback,
      errorCallback
    );
    this.Log.debug(
      request,
      "Sent event on Dummy Connection"
    );
    for (let i: number = 0; i < this.mResponses.length; i += 1) {
      if (this.mResponses[i].command === command && this.mResponses[i].condition.check(object)) {
        request.setResponse(this.mResponses[i].value);
        break;
      }
    }
    for (let i: number = 0; i < this.mErrorResponses.length; i += 1) {
      if (this.mErrorResponses[i].command === command && this.mErrorResponses[i].condition.check(object)) {
        request.setErrorResponse(this.mErrorResponses[i].value);
        break;
      }
    }
    this.mSentObjects.push({command: command, object: object});
    request.send();
    return request;
  }

  public openStream(): void {
    this.mIsStreamOpened = true;
  }

  public closeStream(): void {
    this.mIsStreamOpened = false;
  }

  public isStreamOpened(): boolean {
    return this.mIsStreamOpened;
  }

  public onStreamEvent(callback: Callback): void {
    this.mOnStreamEventCbk = callback;
  }

  public onStreamError(callback: Callback): void {
    this.mOnStreamErrorCbk = callback;
  }

  public onEndProcessResponses(callback: Callback): void {
    this.mOnEndProcessResponsesCbk = callback;
  }

  public pushStreamEvent(event: BasicEvent): void {
    if (typeof this.mOnStreamEventCbk !== "undefined") {
      this.mOnStreamEventCbk.run(event);
    }
  }

  public pushStreamError(zxError: ZxError): void {
    if (typeof this.mOnStreamErrorCbk !== "undefined") {
      this.mOnStreamErrorCbk.run(zxError);
    }
  }

  public setRequestResponse(command: string, value: any, condition: Condition = Condition.pass): void {
    this.mResponses.push({
      command: command,
      value: value,
      condition: condition
    });
  }

  public setErrorRequestResponse(command: string, value: any, condition: Condition = Condition.pass): void {
    this.mErrorResponses.push({
      command: command,
      value: value,
      condition: condition
    });
  }

  public getSentObjects(): {}[] {
    return this.mSentObjects;
  }

  public flushSentObjects(): void {
    this.mSentObjects = [];
  }
}

interface ResponseContainer {
  command: string;
  value: any;
  condition: Condition;
}
