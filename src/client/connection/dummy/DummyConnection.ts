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

import {Callback} from "../../../lib/callbacks/Callback";
import {Condition} from "../../../lib/Condition";
import {ZxError} from "../../../lib/error/ZxError";
import {LogEngine} from "../../../lib/log/LogEngine";
import {BasicEvent} from "../../events/BasicEvent";
import {IConnection} from "../IConnection";
import {IRequest} from "../IRequest";
import {IRequestFactory} from "../IRequestFactory";
import {DummyRequest} from "./DummyRequest";

export class DummyConnection implements IConnection {

  public  mRequestFactory: IRequestFactory;

  private Log = LogEngine.getLogger(LogEngine.CHAT);
  private mRequestCount: number = 0;
  private mIsStreamOpened: boolean = false;
  private mOnStreamEventCbk: Callback;
  private mOnStreamErrorCbk: Callback;
  private mOnEndProcessResponsesCbk: Callback;
  private mSentObjects: Array<{}> = [];
  private mResponses: IResponseContainer[] = [];
  private mErrorResponses: IResponseContainer[] = [];

  constructor(
    requestFactory: IRequestFactory,
  ) {
    this.mRequestFactory = requestFactory;
  }

  public sendObject(
    command: string,
    object: {},
    callback: Callback,
    errorCallback: Callback,
  ): IRequest {
    const request: DummyRequest = this.mRequestFactory.createRequest(
      (++this.mRequestCount),
      command,
      object,
      callback,
      errorCallback,
    ) as DummyRequest;
    this.Log.debug(
      request,
      "Sent event on Dummy Connection",
    );
    for (const response of this.mResponses) {
      if (response.command === command && response.condition.check(object)) {
        request.setResponse(response.value);
        break;
      }
    }
    for (const errorResponse of this.mResponses) {
      if (errorResponse.command === command && errorResponse.condition.check(object)) {
        request.setErrorResponse(errorResponse.value);
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
      condition: condition,
      value: value,
    });
  }

  public setErrorRequestResponse(command: string, value: any, condition: Condition = Condition.pass): void {
    this.mErrorResponses.push({
      command: command,
      condition: condition,
      value: value,
    });
  }

  public getSentObjects(): Array<{}> {
    return this.mSentObjects;
  }

  public flushSentObjects(): void {
    this.mSentObjects = [];
  }
}

interface IResponseContainer {
  command: string;
  value: any;
  condition: Condition;
}
