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
import {IBasicEvent} from "../../events/IBasicEvent";
import {IChatEvent} from "../../events/IChatEvent";
import {IChatEventParser} from "../../events/parsers/IChatEventParser";
import {ICommandFactory} from "../ICommandFactory";
import {IConnection} from "../IConnection";
import {IConnectionManager} from "../IConnectionManager";

export class TestConnectionManager implements IConnectionManager {

  private mConnection: IConnection;
  private mCommandFactory: ICommandFactory;
  private mEventParser: IChatEventParser<IChatEvent>;

  constructor(connection: IConnection, commandFactory: ICommandFactory, eventParser: IChatEventParser<IChatEvent>) {
    this.mConnection = connection;
    this.mCommandFactory = commandFactory;
    this.mEventParser = eventParser;
  }

  public dispatch(rawEvent: {}): void {
    const ev: IChatEvent = this.mEventParser.decodeEvent(undefined, rawEvent);
    this.mOnEvent(ev);
  }

  public sendEvent(event: IBasicEvent, callback: Callback, errorCallback?: Callback): void {
    let eventObject: {} = void 0;

    try {
      eventObject = this.mEventParser.encodeEvent(event as IChatEvent);
    } catch (err) {}
    if (typeof eventObject !== "undefined") {
      try {
        this.mConnection.sendObject(
          this.mCommandFactory.getCommand(event as IChatEvent),
          eventObject,
          callback,
          errorCallback,
        );
      } catch (err) {}
    }
  }

  public onEvent(callback: (event: IBasicEvent) => void): void {
    this.mOnEvent = callback;
  }

  public onEndProcessResponses(callback: () => void): void {
    throw new Error("Method not implemented.");
  }

  public onBadGatewayError(callback: (err: Error) => void): void {
    throw new Error("Method not implemented.");
  }

  public onNoSuchChatSession(callback: (err: Error) => void): void {
    throw new Error("Method not implemented.");
  }

  public onHTTPError(callback: (err: Error) => void): void {
    throw new Error("Method not implemented.");
  }

  public onNetworkError(callback: (err: Error) => void): void {
    throw new Error("Method not implemented.");
  }

  public openStream(): void {
    throw new Error("Method not implemented.");
  }

  public closeStream(): void {
    throw new Error("Method not implemented.");
  }

  private mOnEvent: (event: IBasicEvent) => void = (ev) => { throw new Error("Method not implemented."); };

}
