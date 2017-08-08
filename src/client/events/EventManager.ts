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

import {ChatEvent} from "./ChatEvent";
import {ChatClient} from "../ChatClient";
import {ChatEventHandler} from "./handlers/ChatEventHandler";
import {Logger} from "../../lib/log/Logger";
import {LogEngine} from "../../lib/log/LogEngine";

export class EventManager {

  protected mHandlersMap: {[eventType: number]: ChatEventHandler[]};
  private Log: Logger;

  constructor() {
    this.mHandlersMap = {};
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
  }

  public addEventHandler(handler: ChatEventHandler): void {
    if (!this.mHandlersMap.hasOwnProperty(handler.getEventCode().toString())) {
      this.mHandlersMap[handler.getEventCode()] = [];
    }
    this.mHandlersMap[handler.getEventCode()].push(handler);
  }

  public handleEvent(chatEvent: ChatEvent, client: ChatClient): boolean {
    let handled: boolean = false;
    if (this.mHandlersMap.hasOwnProperty(chatEvent.getCode().toString())) {
      for (let handler of this.mHandlersMap[chatEvent.getCode()]) {
        try {
          handled = handler.handleEvent(chatEvent, client);
        }
        catch (error) {
          this.Log.debug(error, "EventManager.handleEvent");
        }
      }
    }
    return handled;
  }

}