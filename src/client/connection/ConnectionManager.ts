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
import {BasicEvent} from "../events/BasicEvent";
import {ConnectionEventParser} from "../events/parsers/ConnectionEventParser";

export interface ConnectionManager {

  sendEvent(event: BasicEvent, callback: Callback, errorCallback: Callback): void;
  onEvent(callback: Callback): void;
  onError(callback: Callback): void;
  onEndProcessResponses(callback: Callback): void;
  onBadGatewayError(callback: Callback): void;
  onNoSuchChatSession(callback: Callback): void;
  onHTTPError(callback: Callback): void;
  onNetworkError(callback: Callback): void;
  openStream(): void;
  closeStream(): void;
  getEventParser(): ConnectionEventParser;

}
