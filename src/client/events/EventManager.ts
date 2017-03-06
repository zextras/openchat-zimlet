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
import {ChatPlugin} from "../../lib/plugin/ChatPlugin";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";

export class EventManager {

  protected mHandlersMap: {[eventType: number]: ChatEventHandler[]};
  private mPluginManager: ChatPluginManager;

  constructor() {
    this.mHandlersMap = {};
    this.mPluginManager = new ChatPluginManager();
    this.mPluginManager.switchOn(this);
  }

  public registerEventPlugin(eventId: number, plugin: ChatPlugin) {
    this.mPluginManager.registerPlugin(String(eventId), plugin);
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
        handled = handler.handleEvent(chatEvent, client);
      }
      this.mPluginManager.triggerPlugins(String(chatEvent.getCode()), chatEvent, client);
    }
    return handled;
  }

}