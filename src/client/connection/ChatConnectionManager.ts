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

import {JSON3} from "../../libext/json3";

import {ConnectionManager} from "./ConnectionManager";
import {Callback} from "../../lib/callbacks/Callback";
import {BasicEvent} from "../events/BasicEvent";
import {ChatEvent} from "../events/ChatEvent";
import {Connection} from "./Connection";
import {CommandFactory} from "./CommandFactory";
import {ConnectionEventParser} from "../events/parsers/ConnectionEventParser";
import {LogEngine} from "../../lib/log/LogEngine";
import {ZxError} from "../../lib/error/ZxError";
import {ZxErrorCode} from "../../lib/error/ZxErrorCode";
import {ZmCsfeException} from "../../zimbra/zimbra/csfe/ZmCsfeException";
import {ArrayUtils} from "../../lib/ArrayUtils";

export class ChatConnectionManager implements ConnectionManager {

  private Log = LogEngine.getLogger(LogEngine.CHAT);

  private mConnection: Connection;
  private mCommandFactory: CommandFactory;
  public mEventParser: ConnectionEventParser;

  private mOnEventCbk: Callback;
  private mOnErrorCbk: Callback;
  private mOnEndProcessResponsesCbk: Callback;
  private mOnNoSuchChatSessionCbk: Callback;
  private mOnBadGatewayErrorCbk: Callback;
  private mOnHttpErrorCbk: Callback;
  private mOnNetworkErrorCbk: Callback;

  constructor(
    connection: Connection,
    commandFactory: CommandFactory,
    eventParser: ConnectionEventParser
  ) {
    this.mConnection = connection;
    this.mCommandFactory = commandFactory;
    this.mEventParser = eventParser;

    this.mConnection.onStreamEvent(new Callback(this, this.handleStreamEvent));
    this.mConnection.onStreamError(new Callback(this, this.handleStreamError));
    this.mConnection.onEndProcessResponses(new Callback(this, this.handleEndProcessResponses));
  }

  public sendEvent(
    event: BasicEvent,
    callback: Callback = new Callback(this, this.returnTrueFcn),
    errorCallback?: Callback
  ): void {
    callback = Callback.standardize(callback);
    if (typeof errorCallback === "undefined") {
      errorCallback = new Callback(
        void 0,
        ChatConnectionManager.defaultErrorFcn,
        callback
      );
    } else {
      errorCallback = Callback.standardize(errorCallback);
    }

    let eventObject: {} = void 0,
      error: ZxError = void 0;

    try {
      eventObject = this.mEventParser.encodeEvent(<ChatEvent>event);
    } catch (err) {
      error = new ZxError(ZxErrorCode.UNABLE_TO_ENCODE_EVENT_OBJECT, err);
      error.setDetail("object", JSON3.stringify(<ChatEvent>event, null, 2));
    }

    if (typeof eventObject !== "undefined") {
      try {
        this.mConnection.sendObject(
          this.mCommandFactory.getCommand(<ChatEvent>event),
          eventObject,
          new Callback(this, this.processResponse, <ChatEvent>event, callback, errorCallback),
          new Callback(this, this.processError, <ChatEvent>event, errorCallback)
        );
      } catch (err) {
        error = new ZxError(ZxErrorCode.UNABLE_TO_SEND_EVENT_OBJECT, err);
        error.setDetail("object", JSON3.stringify(eventObject, null, 2));
      }
    }

    if (typeof error !== "undefined") {
      errorCallback.run(error);
    }
  }

  private static defaultErrorFcn(cbk: Callback, error: Error): boolean {
    return cbk.run(void 0, error);
  }

  public onEvent(callback: Callback): void {
    this.mOnEventCbk = callback;
  }

  public onError(callback: Callback): void {
    this.mOnErrorCbk = callback;
  }

  public onEndProcessResponses(callback: Callback): void {
    this.mOnEndProcessResponsesCbk = callback;
  }

  public onBadGatewayError(callback: Callback): void {
    this.mOnBadGatewayErrorCbk = callback;
  }

  public onNoSuchChatSession(callback: Callback): void {
    this.mOnNoSuchChatSessionCbk = callback;
  }

  public onHTTPError(callback: Callback): void {
    this.mOnHttpErrorCbk = callback;
  }

  public onNetworkError(callback: Callback): void {
    this.mOnNetworkErrorCbk = callback;
  }

  public openStream(): void {
    this.mConnection.openStream();
  }

  public closeStream(): void {
    this.mConnection.closeStream();
  }

  public getEventParser(): ConnectionEventParser {
    return this.mEventParser;
  }

  private processResponse(originEvent: BasicEvent, callback: Callback, errorCallback: Callback, responses: BasicEvent): void;
  private processResponse(originEvent: BasicEvent, callback: Callback, errorCallback: Callback, responses: BasicEvent[]): void;
  private processResponse(originEvent: BasicEvent, callback: Callback, errorCallback: Callback, responses: any): void {
    if (!ArrayUtils.isArray(responses)) { // TODO: Investigate about it
      responses = [<BasicEvent>responses];
    }
    for (let i: number = 0; i < responses.length; i += 1) {
      let event: BasicEvent = void 0;
      try {
        event = this.mEventParser.decodeEvent(originEvent, responses[i]);
      } catch (err) {
        let error = new ZxError(ZxErrorCode.UNABLE_TO_DECODE_EVENT_OBJECT, err);
        error.setDetail("object", JSON3.stringify(event, null, 2));
        error.setDetail("originEvent", JSON3.stringify(originEvent, null, 2));
        if (typeof errorCallback !== "undefined") {
          errorCallback.run(error);
        }
      }

      try {
        if (typeof callback !== "undefined" && typeof event !== "undefined") {
          callback.run(event);
        }
      } catch (err) {
        let error = new ZxError(ZxErrorCode.UNABLE_TO_HANDLE_EVENT_ERROR, err);
        error.setDetail("event", JSON3.stringify(event, null, 2));
        if (typeof errorCallback !== "undefined") {
          errorCallback.run(error);
        }
      }
    }
  }

  private processError(event: BasicEvent, callback: Callback, error: ZxError): boolean {
    if (typeof callback !== "undefined") {
      try {
        return callback.run(error);
      } catch (err) {
        this.Log.err(err, "Error while processing an error received on connection");
      }
    }
    return false;
  }

  private handleStreamEvent(event: BasicEvent): void {
    let decodedEvent = this.mEventParser.decodeEvent(void 0, event);
    this.Log.debug(decodedEvent, "Received and event on stream");
    if (typeof this.mOnEventCbk !== "undefined") {
      this.mOnEventCbk.run(decodedEvent);
    }
  }

  private handleStreamError(error: ZxError): void  {
    if (error.getCode() === ZxErrorCode.NO_SUCH_CHAT_SESSION
        && typeof this.mOnNoSuchChatSessionCbk !== "undefined") {
      this.mOnNoSuchChatSessionCbk.run(error);

    } else if (error.getCode() === ZxErrorCode.DETECTED_502
               && typeof this.mOnBadGatewayErrorCbk !== "undefined") { // Bad Gateway, probably a misconfiguration
      this.mOnBadGatewayErrorCbk.run(error);

    } else if (error.getCode() === ZxErrorCode.ZM_CSFE_EXCEPTION
               && typeof this.mOnHttpErrorCbk !== "undefined") {
      this.mOnHttpErrorCbk.run(error);

    } else if ((error.getCode() === ZxErrorCode.AJX_EXCEPTION
                || error.getCode() === ZmCsfeException.EMPTY_RESPONSE)
               && typeof this.mOnNetworkErrorCbk !== "undefined") {
      this.mOnNetworkErrorCbk.run(error);

    } else {
      if (typeof this.mOnErrorCbk !== "undefined") {
        this.mOnErrorCbk.run(error);
      } else {
        this.Log.err(error, "ChatConnectionManager.handleStreamError");
      }
    }
  }

  private handleEndProcessResponses(): void {
    if (typeof this.mOnEndProcessResponsesCbk !== "undefined") {
      this.mOnEndProcessResponsesCbk.run();
    }
  }

  private returnTrueFcn(result: any): boolean {
    return true;
  }

}
