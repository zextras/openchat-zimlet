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

import {LogEngine} from "../../lib/log/LogEngine";
import {Logger} from "../../lib/log/Logger";
import {IChatClient} from "../IChatClient";
import {IChatEventHandler} from "./handlers/IChatEventHandler";
import {IBasicEvent} from "./IBasicEvent";
import {IChatEvent} from "./IChatEvent";
import {IEventManager} from "./IEventManager";

export class EventManager implements IEventManager {

  protected mHandlersMap: {[eventType: number]: Array<IChatEventHandler<IBasicEvent>>};
  private Log: Logger;

  constructor() {
    this.mHandlersMap = {};
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
  }

  public addEventHandler(handler: IChatEventHandler<IBasicEvent>): void {
    if (!this.mHandlersMap.hasOwnProperty(handler.getEventCode().toString())) {
      this.mHandlersMap[handler.getEventCode()] = [];
    }
    this.mHandlersMap[handler.getEventCode()].push(handler);
  }

  public handleEvent(chatEvent: IBasicEvent, client: IChatClient): boolean {
    let handled: boolean = false;
    // chatEvent can be disposed on page reload
    if (typeof chatEvent !== "undefined" && this.mHandlersMap.hasOwnProperty(chatEvent.getCode().toString())) {
      for (const handler of this.mHandlersMap[chatEvent.getCode()]) {
        try {
          handled = handler.handleEvent(chatEvent as IChatEvent, client);
        } catch (error) {
          this.Log.debug(error, "EventManager.handleEvent");
        }
      }
    }
    return handled;
  }

}
