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
import {TimedCallbackFactory} from "../../../lib/callbacks/TimedCallbackFactory";
import {ZxError} from "../../../lib/error/ZxError";
import {ZxErrorCode} from "../../../lib/error/ZxErrorCode";
import {LogEngine} from "../../../lib/log/LogEngine";
import {ZmCsfeException} from "../../../zimbra/zimbra/csfe/ZmCsfeException";
import {OpenChatEventCode} from "../../events/chat/OpenChatEventCode";
import {SessionInfoProvider} from "../../SessionInfoProvider";
import {IConnection} from "../IConnection";
import {IRequest} from "../IRequest";
import {Command} from "./Command";
import {IPingManager} from "./IPingManager";

export class PingManager implements IPingManager {

  private static COMMAND: string = Command.PING;
  private static MAX_TRY_TIMEOUT: number = 300000; // 5 minutes

  private Log = LogEngine.getLogger(LogEngine.CHAT);

  private mOnStreamEventCbk: Callback;
  private mOnStreamErrorCbk: Callback;
  private mConnection: IConnection;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mRequest: IRequest;

  private mIsPinging: boolean = false;
  private mRetryAttempted: number = -1;
  private mHandlePingCbk: Callback = new Callback(this, this.handlePing);
  private mHandlePingErrorCbk: Callback = new Callback(this, this.handlePingError);
  private mDoPingCallback: Callback = new Callback(this, this.doPing);
  private mOnEndProcessResponsesCbk: Callback;
  private mSessionInfoProvider: SessionInfoProvider;

  constructor(
    timedCallbackFactory: TimedCallbackFactory,
    sessionInfoProvider: SessionInfoProvider,
  ) {
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mSessionInfoProvider = sessionInfoProvider;
  }

  public setConnection(connection: IConnection): void {
    this.mConnection = connection;
  }

  public openStream(): void {
    if (!this.mIsPinging && typeof this.mConnection !== "undefined") {
      this.mIsPinging = true;
      this.doPing();
    }

  }

  public closeStream(): void {
    if (this.mIsPinging) {
      this.mIsPinging = false;
      if (typeof this.mRequest !== "undefined") {
        this.mRequest.cancelRequest(this.mHandlePingErrorCbk);
      }
    }
  }

  public isStreamOpened(): boolean {
    return this.mIsPinging;
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

  private doPing(): void {
    if (this.mIsPinging && typeof this.mRequest === "undefined") {
      this.mRetryAttempted++;
      this.mRequest = this.mConnection.sendObject(
        PingManager.COMMAND,
        {
          received_events: this.mSessionInfoProvider.getSessionResponsesReceived(),
        },
        this.mHandlePingCbk,
        this.mHandlePingErrorCbk,
      );
    }
  }

  private handlePing(responses: Array<{type: number}>): void {
    this.mRetryAttempted = -1;
    this.mRequest = void 0;
    this.mSessionInfoProvider.addEventsReceived(responses.length);
    if (typeof responses !== "undefined") {
      if (this.checkPresenceRequiredRegistrationEvent(responses)) {
        return;
      }
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(this, this.processResponses, responses),
        1,
        false,
      ).start();
    }
    this.doPing();
  }

  private checkPresenceRequiredRegistrationEvent(responses: Array<{type: number}>): boolean { // TODO: Investigate on response type
    for (const response of responses) {
      if (response.type === OpenChatEventCode.REQUIRED_REGISTRATION) {
        this.closeStream();
        this.mTimedCallbackFactory.createTimedCallback(
          new Callback(this, this.processResponses, [response]),
          1,
          false,
        ).start();
        return true;
      }
    }
    return false;
  }

  private processResponses(responses: Array<{}>): void {
    for (const response of responses) {
      if (typeof this.mOnStreamEventCbk !== "undefined") {
        this.mOnStreamEventCbk.run(response);
      } else {
        this.Log.debug(response, "Ping event not handed");
      }
    }
    if (typeof this.mOnEndProcessResponsesCbk !== "undefined") {
      this.mOnEndProcessResponsesCbk.run();
    }
  }

  private handlePingError(error: ZxError): boolean {
    this.mRequest = void 0;
    let notify: boolean = true;
    let logWarning: boolean = (this.mRetryAttempted > 0);
    // Limiting the retry time to 30 seconds.
    let waitingTime: number = this.mRetryAttempted * 2000;
    if (waitingTime > PingManager.MAX_TRY_TIMEOUT) { // 5 minutes
      waitingTime = PingManager.MAX_TRY_TIMEOUT;
    } else if (waitingTime < 1) {
      waitingTime = 1000; // Should never happen, however, 1 sec is enough
    }

    if (!(error instanceof ZxError)) {
      error = ZxError.convertError(error);
    }

    if (error.getCode() === ZmCsfeException.EMPTY_RESPONSE && this.mRetryAttempted < 1) {
      // ZXCHAT-251 In some cases, the EMPTY_RESPONSE is thrown by clicking on download attachment link,
      // ignore it as error (the first time).
      notify = false;
    }

    if (error.getCode() === ZxErrorCode.ZM_CSFE_EXCEPTION && error.getDetail("code") === "service.UNKNOWN_DOCUMENT" && this.mRetryAttempted < 1) {
      // ZXCHAT-493 Add a panic-button, if there are too many request to the server, shutting it down
      //   will trigger a 5 minutes timeout.
      notify = false;
      waitingTime = PingManager.MAX_TRY_TIMEOUT;
      logWarning = true;
    }

    if (notify) {
      if (typeof this.mOnStreamErrorCbk !== "undefined") {
        // this.mOnStreamErrorCbk.run(error);
      }
    }

    // In case of the concurrent ping, stop this stream.
    if (error.getCode() === ZxErrorCode.CHAT_CONCURRENT_PING) {
      this.Log.err(new Error("Concurrent ping detected"), "PingManager.handlePingError");
      return true;
    }

    if (logWarning) {
      this.Log.warn(
        "Ping response error #" + this.mRetryAttempted + " trying in " + (waitingTime / 1000) + "s",
        "PingManager.handlePingError",
      );
    }

    this.mTimedCallbackFactory.createTimedCallback(
      this.mDoPingCallback,
      waitingTime,
    ).start();

    return true; // The error is handled here, no need to retry or manage again the request by ZmRequestMgr
  }
}
