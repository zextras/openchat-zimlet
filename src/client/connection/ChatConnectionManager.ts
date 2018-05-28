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

import {JSON3 as JSON} from "../../libext/json3";

import {ArrayUtils} from "../../lib/ArrayUtils";
import {Callback} from "../../lib/callbacks/Callback";
import {ZxError} from "../../lib/error/ZxError";
import {ZxErrorCode} from "../../lib/error/ZxErrorCode";
import {LogEngine} from "../../lib/log/LogEngine";
import {ZmCsfeException} from "../../zimbra/zimbra/csfe/ZmCsfeException";
import {IBasicEvent} from "../events/IBasicEvent";
import {IChatEvent} from "../events/IChatEvent";
import {IConnectionEventParser} from "../events/parsers/IConnectionEventParser";
import {ISessionInfoProvider} from "../ISessionInfoProvider";
import {ICommandFactory} from "./ICommandFactory";
import {IConnection} from "./IConnection";
import {IConnectionManager} from "./IConnectionManager";

export class ChatConnectionManager implements IConnectionManager {

  private static defaultErrorFcn(cbk: Callback, error: Error): boolean {
    return cbk.run(void 0, error);
  }

  public mEventParser: IConnectionEventParser;

  private Log = LogEngine.getLogger(LogEngine.CHAT);
  private mConnection: IConnection;
  private mCommandFactory: ICommandFactory;
  private mSessionInfoProvider: ISessionInfoProvider;
  private mOnEventCbk: (event: IBasicEvent) => void;
  private mOnEndProcessResponsesCbk: () => void;
  private mOnNoSuchChatSessionCbk: (err: Error) => void;
  private mOnBadGatewayErrorCbk: (err: Error) => void;
  private mOnHttpErrorCbk: (err: Error) => void;
  private mOnNetworkErrorCbk: (err: Error) => void;

  constructor(
    connection: IConnection,
    commandFactory: ICommandFactory,
    eventParser: IConnectionEventParser,
    sessionInfoProvider: ISessionInfoProvider,
  ) {
    this.mConnection = connection;
    this.mCommandFactory = commandFactory;
    this.mEventParser = eventParser;
    this.mSessionInfoProvider = sessionInfoProvider;

    this.mConnection.onStreamEvent(new Callback(this, this.handleStreamEvent));
    this.mConnection.onStreamError(new Callback(this, this.handleStreamError));
    this.mConnection.onEndProcessResponses(new Callback(this, this.handleEndProcessResponses));
  }

  public sendEvent(
    event: IChatEvent,
    callback: Callback = new Callback(this, this.returnTrueFcn),
    errorCallback?: Callback,
  ): void {
    this.Log.debug(event, "Send event");
    if (event.getSender() == null) {
      event.setSender(this.mSessionInfoProvider.getUsername() + "/" + this.mSessionInfoProvider.getSessionId());
    }
    callback = Callback.standardize(callback);
    if (typeof errorCallback === "undefined") {
      errorCallback = new Callback(
        void 0,
        ChatConnectionManager.defaultErrorFcn,
        callback,
      );
    } else {
      errorCallback = Callback.standardize(errorCallback);
    }

    let eventObject: {} = void 0;
    let error: ZxError = void 0;

    try {
      eventObject = this.mEventParser.encodeEvent(event as IChatEvent);
    } catch (err) {
      error = new ZxError(ZxErrorCode.UNABLE_TO_ENCODE_EVENT_OBJECT, err);
      error.setDetail("object", JSON.stringify(event as IChatEvent, null, 2));
    }

    if (typeof eventObject !== "undefined") {
      try {
        this.mConnection.sendObject(
          this.mCommandFactory.getCommand(event as IChatEvent),
          eventObject,
          new Callback(this, this.processResponse, event as IChatEvent, callback, errorCallback),
          new Callback(this, this.processError, event as IChatEvent, errorCallback),
        );
      } catch (err) {
        error = new ZxError(ZxErrorCode.UNABLE_TO_SEND_EVENT_OBJECT, err);
        error.setDetail("object", JSON.stringify(eventObject, null, 2));
      }
    }

    if (typeof error !== "undefined") {
      errorCallback.run(error);
    }
  }

  public onEvent(callback: (event: IChatEvent) => void): void {
    this.mOnEventCbk = callback;
  }

  // public onError(callback: Callback): void {
  //   this.mOnErrorCbk = callback;
  // }

  public onEndProcessResponses(callback: () => void): void {
    this.mOnEndProcessResponsesCbk = callback;
  }

  public onBadGatewayError(callback: (err: Error) => void): void {
    this.mOnBadGatewayErrorCbk = callback;
  }

  public onNoSuchChatSession(callback: (err: Error) => void): void {
    this.mOnNoSuchChatSessionCbk = callback;
  }

  public onHTTPError(callback: (err: Error) => void): void {
    this.mOnHttpErrorCbk = callback;
  }

  public onNetworkError(callback: (err: Error) => void): void {
    this.mOnNetworkErrorCbk = callback;
  }

  public openStream(): void {
    this.mConnection.openStream();
  }

  public closeStream(): void {
    this.mConnection.closeStream();
  }

  private processResponse(
    originEvent: IBasicEvent,
    callback: Callback,
    errorCallback: Callback,
    responses: IBasicEvent | IBasicEvent[] | any,
  ): void {
    if (!ArrayUtils.isArray(responses)) { // TODO: Investigate about it
      responses = [responses as IBasicEvent];
    }
    for (const response of responses) {
      let event: IBasicEvent = void 0;
      try {
        event = this.mEventParser.decodeEvent(originEvent, response);
      } catch (err) {
        const error = new ZxError(ZxErrorCode.UNABLE_TO_DECODE_EVENT_OBJECT, err);
        error.setDetail("object", JSON.stringify(event, null, 2));
        error.setDetail("originEvent", JSON.stringify(originEvent, null, 2));
        if (typeof errorCallback !== "undefined") {
          errorCallback.run(error);
        }
      }

      try {
        if (typeof callback !== "undefined" && typeof event !== "undefined") {
          callback.run(event);
        }
      } catch (err) {
        const error = new ZxError(ZxErrorCode.UNABLE_TO_HANDLE_EVENT_ERROR, err);
        error.setDetail("event", JSON.stringify(event, null, 2));
        if (typeof errorCallback !== "undefined") {
          errorCallback.run(error);
        }
      }
    }
  }

  private processError(event: IBasicEvent, callback: Callback, error: ZxError): boolean {
    if (typeof callback !== "undefined") {
      try {
        return callback.run(error);
      } catch (err) {
        this.Log.err(err, "Error while processing an error received on connection");
      }
    }
    return false;
  }

  private handleStreamEvent(event: IBasicEvent): void {
    try {
      const decodedEvent = this.mEventParser.decodeEvent(void 0, event);
      this.Log.debug(decodedEvent, "Received an event on stream");
      if (typeof this.mOnEventCbk !== "undefined") {
        this.mOnEventCbk(decodedEvent);
      }
    } catch (err) {
      this.Log.warn(err, "Unable to decode event");
    }
  }

  private handleStreamError(error: ZxError): void  {
    if (error.getCode() === ZxErrorCode.NO_SUCH_CHAT_SESSION
        && typeof this.mOnNoSuchChatSessionCbk !== "undefined") {
      this.mOnNoSuchChatSessionCbk(error);

    } else if (error.getCode() === ZxErrorCode.DETECTED_502
               && typeof this.mOnBadGatewayErrorCbk !== "undefined") { // Bad Gateway, probably a misconfiguration
      this.mOnBadGatewayErrorCbk(error);

    } else if (error.getCode() === ZxErrorCode.ZM_CSFE_EXCEPTION
               && typeof this.mOnHttpErrorCbk !== "undefined") {
      this.mOnHttpErrorCbk(error);

    } else if ((error.getCode() === ZxErrorCode.AJX_EXCEPTION
                || error.getCode() === ZmCsfeException.EMPTY_RESPONSE)
               && typeof this.mOnNetworkErrorCbk !== "undefined") {
      this.mOnNetworkErrorCbk(error);

    } else {
      this.Log.err(error, "ChatConnectionManager.handleStreamError");
    }
  }

  private handleEndProcessResponses(): void {
    if (typeof this.mOnEndProcessResponsesCbk !== "undefined") {
      this.mOnEndProcessResponsesCbk();
    }
  }

  private returnTrueFcn(result: any): boolean {
    return true;
  }

}
