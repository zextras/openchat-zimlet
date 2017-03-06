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

import {SettingsHandlerInterface} from "./SettingsHandlerInterface";
import {Callback} from "../../lib/callbacks/Callback";
import {Setting} from "../Setting";
import {SettingsUtils} from "../SettingsUtils";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {ChatZimletBase} from "../../ChatZimletBase";

export class ConfigHandler implements SettingsHandlerInterface {

  private mZimletContext: ChatZimletBase;
  private mTimedCallbackFactory: TimedCallbackFactory;

  constructor(zimletContext: ChatZimletBase, timedCallbackFactory: TimedCallbackFactory) {
    this.mZimletContext = zimletContext;
    this.mTimedCallbackFactory = timedCallbackFactory;
  }

  public set(key: string, value: string|number, callback: Callback): void {
    // Config is read-only, so we call the callback immediately...
    this.mTimedCallbackFactory.createTimedCallback(callback, 1);
  }

  public get(key: string): any {
    return this.mZimletContext.getConfig(key);
  }

  public settingsHandled(): string[] {
    return [
      Setting.TURN_URL,
      Setting.TURN_CREDENTIAL,
      Setting.TURN_USERNAME
    ];
  }

  public isSettingHandled(key: string): boolean {
    return SettingsUtils.isSettingHandled(key, this.settingsHandled());
  }

}
