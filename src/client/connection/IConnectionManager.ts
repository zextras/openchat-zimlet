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

import {Callback} from "../../lib/callbacks/Callback";
import {IBasicEvent} from "../events/IBasicEvent";

export interface IConnectionManager {

  sendEvent(event: IBasicEvent, callback: Callback, errorCallback?: Callback): void;
  onEvent(callback: (event: IBasicEvent) => void): void;
  // onError(callback: Callback): void;
  onEndProcessResponses(callback: () => void): void;
  onBadGatewayError(callback: (err: Error) => void): void;
  onNoSuchChatSession(callback: (err: Error) => void): void;
  onHTTPError(callback: (err: Error) => void): void;
  onNetworkError(callback: (err: Error) => void): void;
  openStream(): void;
  closeStream(): void;

}
