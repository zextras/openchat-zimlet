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

import {ChatPlugin} from "./ChatPlugin";
import {ChatFieldPlugin} from "./ChatFieldPlugin";

export class ChatPluginManager {

  private mFieldPluginMap: {[title: string]: ChatFieldPlugin};
  private mPluginMap: {[title: string]: ChatPlugin[]};
  private mEnabled: boolean = false;
  private mContext: any;

  constructor() {
    this.mPluginMap = {};
    this.mFieldPluginMap = {};
  }

  public switchOn(context: any) {
    this.mContext = context;
    this.mEnabled = true;
  }

  public registerPlugin(title: string, plugin: ChatPlugin): void {
    if (typeof this.mPluginMap[title] === "undefined" || this.mPluginMap === null) {
      this.mPluginMap[title] = [];
    }
    this.mPluginMap[title].push(plugin);
  }

  public triggerPlugins(title: string, ...args: any[]): void {
    if (typeof this.mPluginMap[title] !== "undefined" && this.mPluginMap !== null) {
      for (let plugin of this.mPluginMap[title]) {
        plugin.trigger.apply(
          plugin,
          [].concat(this.mContext).concat(args)
        );
      }
    }
  }

  public registerFieldPlugin(fieldName: string, plugin: ChatFieldPlugin): void {
    this.mFieldPluginMap[fieldName] = plugin;
  }

  public setFieldPlugin(fieldName: string, value: any): void {
    this.mFieldPluginMap[fieldName].setField(value);
  }

  public getFieldPlugin(fieldName: string): any {
    if (typeof this.mFieldPluginMap[fieldName] !== "undefined" && this.mFieldPluginMap[fieldName] !== null)
      return this.mFieldPluginMap[fieldName].getField();
    else {
      return undefined;
    }
  }

  // convertParamsAndTriggerPlugins(title: string, paramsArray: any, ...args: any[]): void {
  //
  // }

  // private static checkRequiredParams(plugin: ChatPlugin, params: any): boolean {
  //   let checkPassed: boolean = true;
  //   for (let requiredParam of plugin.requiredParams()) {
  //     if (!params.hasOwnProperty(requiredParam)) {
  //       checkPassed = false;
  //     }
  //   }
  //   return checkPassed;
  // }
}
