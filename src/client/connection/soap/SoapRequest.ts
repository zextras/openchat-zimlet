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

import {Callback} from "../../../lib/callbacks/Callback";
import {AjxCallback} from "../../../zimbra/ajax/boot/AjxCallback";
import {AjxSoapDoc, AjxSoapDocParams} from "../../../zimbra/ajax/soap/AjxSoapDoc";
import {ZmCsfeResult} from "../../../zimbra/zimbra/csfe/ZmCsfeResult";

import {ZxError} from "../../../lib/error/ZxError";
import {ZxErrorCode} from "../../../lib/error/ZxErrorCode";
import {LogEngine} from "../../../lib/log/LogEngine";
import {ZmZimbraMail} from "../../../zimbra/zimbraMail/core/ZmZimbraMail";
import {ZmController} from "../../../zimbra/zimbraMail/share/controller/ZmController";
import {IRequest} from "../IRequest";

export class SoapRequest implements IRequest {

  private static KEY_ACTION: string = "action";
  private static KEY_SESSION_ID: string = "session_id";

  private Log = LogEngine.getLogger(LogEngine.CHAT);

  private mAppController: ZmController;
  private mSessionId: string;
  private requestId: string;
  private mCommand: string;
  private mObject: {[key: string]: any};
  private mCallback: Callback;
  private mErrorCbk: Callback;

  private mReqType: string;
  private mUrn: string;
  private mSoapDocParams: AjxSoapDocParams;
  private mCtrlReqId: string;
  private initError: ZxError;

  constructor(
    appController: ZmController,
    sessionId: string,
    requestId: string,
    command: string,
    object: {[key: string]: any} = {},
    callback?: Callback,
    errorCallback?: Callback,
  ) {
    this.mAppController = appController;
    this.mSessionId = sessionId;
    this.requestId = requestId;
    this.mCommand = command;
    this.mObject = object;
    this.mCallback = callback;
    this.mErrorCbk = errorCallback;

    this.mReqType = "ZxChatRequest";
    this.mUrn = "urn:zimbraAccount";

    this.mSoapDocParams = {
      asyncMode: true,
      busyMsg: "ZeXtras Chat Requesting...",
      callback: new AjxCallback(this, this.processResponse),
      errorCallback: new AjxCallback(this, this.processErrorResponse),
      noAuthToken: true,
      noBusyOverlay: true,
      soapDoc: AjxSoapDoc.create(this.mReqType, this.mUrn),
    };

    for (const key in this.mObject) {
      if (!this.mObject.hasOwnProperty(key)) { continue; }
      this.set(key, this.mObject[key]);
    }

    this.set(SoapRequest.KEY_ACTION, command);
    if (typeof this.mSessionId !== "undefined" && this.mSessionId !== null) {
      this.set(SoapRequest.KEY_SESSION_ID, this.mSessionId);
    }
  }

  public set(key: string, value: any): void {
    if (value instanceof Date) {
      this.mObject[key] = value;
      this.mSoapDocParams.soapDoc.set(key, value);
    } else if (value instanceof Object) {
      const val: string = JSON.stringify(value);
      this.mObject[key] = val;
      this.mSoapDocParams.soapDoc.set(key, val);
    } else if (typeof value === "boolean") {
      const val: string = (value) ? "true" : "false";
      this.mObject[key] = val;
      this.mSoapDocParams.soapDoc.set(key, val);
    } else if (typeof value === "number") {
      this.mObject[key] = value.toString();
      this.mSoapDocParams.soapDoc.set(key, value.toString());
    } else {
      this.mObject[key] = value;
      this.mSoapDocParams.soapDoc.set(key, value);
    }
  }

  public get(key: string): any {
    return this.mObject[key];
  }

  public send(): string {
    this.initError = new ZxError(ZxErrorCode.UNKNOWN_ERROR);
    this.mCtrlReqId = (this.mAppController as ZmZimbraMail).sendRequest(this.mSoapDocParams) as string;
    return this.mCtrlReqId;
  }

  public cancelRequest(errorCbk?: Callback): void {
    (this.mAppController as ZmZimbraMail).cancelRequest(
      this.mCtrlReqId,
      new AjxCallback(this, this.cancelRequestCbk, [errorCbk]),
      true,
    );
  }

  private processResponse(response: ZmCsfeResult): void {
    const resp: {error?: Error, responses?: string} = response.getResponse().response as {};

    if (typeof resp !== "undefined" && typeof resp.error !== "undefined") {
      this.processErrorResponse(ZxError.fromResponse(resp as {error: Error}));

    } else if (typeof resp !== "undefined" && typeof resp.responses !== "undefined") {
      try {
        const responses = JSON.parse(resp.responses);
        if (typeof this.mCallback !== "undefined") {
          this.mCallback.run(responses);
        }
      } catch (err) {
        this.Log.err(err, "Error in SoapRequest.processResponse");
        const error = new ZxError(ZxErrorCode.UNABLE_TO_PARSE_JSON_STRING, err);
        error.setDetail("json", resp.responses);
        if (typeof this.mErrorCbk !== "undefined") {
          this.mErrorCbk.run(error);
        }
      }

    } else if (typeof resp !== "undefined") {
      try {
        if (typeof this.mCallback !== "undefined") {
          this.mCallback.run(resp);
        }
      } catch (err) {
        this.Log.err(err, "Error in SoapRequest.processResponse");
        if (typeof this.mErrorCbk !== "undefined") {
          this.mErrorCbk.run(err);
        }
      }

    } else {
      try {
        if (typeof this.mCallback !== "undefined") {
          this.mCallback.run(response.getResponse());
        }
      } catch (err) {
        this.Log.err(err, "Error in SoapRequest.processResponse");
        if (typeof this.mErrorCbk !== "undefined") {
          this.mErrorCbk.run(err);
        }
      }

    }
  }

  private cancelRequestCbk(errorCbk: Callback, error: Error): void {
    if (typeof errorCbk !== "undefined") {
      errorCbk.run(error);
    }
  }

  private processErrorResponse(error: Error): boolean {
    this.initError.initCause(error);
    if (typeof this.mErrorCbk !== "undefined") {
      return this.mErrorCbk.run(this.initError);
    }
    return false;
  }

}
