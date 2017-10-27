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

import {JSON3} from "../libext/json3";
import {XRegExp} from "../libext/xregexp";

import {ChatZimletBase} from "../ChatZimletBase";
import {MainWindow} from "../dwt/windows/MainWindow";
import {Callback} from "../lib/callbacks/Callback";
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {TimedCallbackFactory} from "../lib/callbacks/TimedCallbackFactory";
import {LogEngine} from "../lib/log/LogEngine";
import {Logger} from "../lib/log/Logger";
import {Version} from "../lib/Version";
import {AjxCallback} from "../zimbra/ajax/boot/AjxCallback";
import {ZmApp} from "../zimbra/zimbraMail/core/ZmApp";
import {ZmSettings} from "../zimbra/zimbraMail/share/model/ZmSettings";
import {UserProperty, ZmZimletContext} from "../zimbra/zimbraMail/share/model/ZmZimletContext";
import {ZimletVersion} from "../ZimletVersion";
import {ConfigHandler} from "./handlers/ConfigHandler";
import {PreferencesHandler} from "./handlers/PreferencesHandler";
import {PropertiesHandler} from "./handlers/PropertiesHandler";
import {ISettingsHandlerInterface} from "./handlers/SettingsHandlerInterface";
import {Setting} from "./Setting";

export class SettingsManager {

  public DELEGATED_ACCESS: boolean;

  private zimletContext: ChatZimletBase;
  private settingsHandlers: ISettingsHandlerInterface[];
  private onChangeCallbacks: {[name: string]: CallbackManager};
  private defaultSettingsHandler: ISettingsHandlerInterface;
  private Log: Logger;
  // TODO: Remove me...

  constructor(
    zimletContext: ChatZimletBase,
    settings: ZmSettings,
    timedCallbackFactory: TimedCallbackFactory,
  ) {
    // TODO: Remove all the "new"s as injected
    this.zimletContext = zimletContext;
    this.settingsHandlers = [];
    this.onChangeCallbacks = {};
    this.defaultSettingsHandler = new PropertiesHandler(zimletContext);
    this.settingsHandlers.push(new PreferencesHandler(settings));
    this.settingsHandlers.push(this.defaultSettingsHandler);
    this.settingsHandlers.push(new ConfigHandler(zimletContext, timedCallbackFactory));
    this.DELEGATED_ACCESS = false;
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
  }

  /**
   * Get a setting trying to read from user property (zimlet property) or from preferences.
   */

  public get(key: string): any {
    const handler = this._getSettingHandler(key);
    return this._cleanGetValue(handler.get(key));
  }

  /**
   * Store a setting.
   */
  public set(key: string, value: any, callback?: Callback): void {
    if (ZmApp.ENABLED_APPS[ZmApp.PREFERENCES] == null) {
      this.Log.warn(`${key}: ${value}`, "Preferences not enabled, cannot save property/preference");
      if (typeof callback !== "undefined") {
        callback.run(value);
      }
    } else {
      const cleanedValue = this._cleanSetValue(value);
      const handler = this._getSettingHandler(key);
      try {
        handler.set(key, cleanedValue, new Callback(this, this._onSet, key, cleanedValue, callback));
      } catch (err) {
        this.Log.err(err, `Unable to set '${key}' property`);
      }
    }
  }

  public onSettingChange(settingKey: string, callback: Callback): void {
    if (!this.onChangeCallbacks.hasOwnProperty(settingKey)) {
      this.onChangeCallbacks[settingKey] = new CallbackManager();
    }
    this.onChangeCallbacks[settingKey].addCallback(callback);
  }

  public enabledEmojiInChatConversation(): boolean {
    return this.get(Setting.IM_USR_PREF_EMOJI_IN_CONV);
  }

  public enabledEmojiInChatHistory(): boolean {
    return this.get(Setting.IM_USR_PREF_EMOJI_IN_HIST);
  }

  public enabledEmojiInMail(): boolean {
    return this.get(Setting.IM_USR_PREF_EMOJI_IN_MAIL);
  }

  public enabledUrlInChatConversation(): boolean {
    return this.get(Setting.IM_USR_PREF_URL_IN_CONV);
  }

  public enabledUrlInChatHistory(): boolean {
    return this.get(Setting.IM_USR_PREF_URL_IN_HIST);
  }

  public enabledUrlInMail(): boolean {
    return this.get(Setting.IM_USR_PREF_URL_IN_MAIL);
  }

  public isZimletTesting(): boolean {
    return ZimletVersion.TESTING;
  }

  public getZimletVersion(): Version {
    const version = new Version(ZimletVersion.VERSION);
    version.setCommit(ZimletVersion.COMMIT);
    return version;
  }

  public getZimletCommitId(): string {
    return ZimletVersion.COMMIT;
  }

  // public getZimletAvailableVersion(): Version {
  //   return this.zimletContext.mAvailableZimletVersion;
  // }

  /**
   * Store the buddies groups into the preference to made the zimlet more responsive at startup.
   * Data will be splitted to Setting._DATA_CHUNK_SIZE characters (approx bytes),
   * split and merge is managed here.
   */
  public storeGroupsData(mainWindow: MainWindow): void {
    const data = mainWindow.getGroupsData();
    if ((ZmApp.ENABLED_APPS[ZmApp.PREFERENCES] == null) || !ZmApp.ENABLED_APPS[ZmApp.PREFERENCES]) {
      return;
    }
    let propValue = JSON3.stringify(data);
    const chunkSize = Setting._DATA_CHUNK_SIZE - Setting._DATA_CHUNK_PREFIX;
    const totSlices = Math.ceil((propValue.length + 2) / chunkSize);
    propValue = totSlices < 10 ? "0" + totSlices + propValue : "" + totSlices + propValue;
    for (let i: number = 0; i < totSlices; i++) {
      const slice = propValue.slice(i * chunkSize, (i + 1) * chunkSize);
      let sliceName = Setting.IM_USR_PREF_GROUP_DATA;
      if (i > 0) {
        if (i < 10) {
          sliceName = Setting.IM_USR_PREF_GROUP_DATA + "_0" + i;
        } else {
          sliceName = Setting.IM_USR_PREF_GROUP_DATA + "_" + i;
        }
      }
      this.set(sliceName, slice, new Callback(this, () => { return; }));
    }
    this.Log.debug(data, "Groups data stored");
  }

  /**
   * Search for the properties labeled as Setting.IM_USR_PREF_GROUP_DATA and reset all of them.
   * Unfortunately we cannot remove user properties. Opted to set to "" to limit the size saved on account.
   */
  public resetGroupsData() {
    if ((ZmApp.ENABLED_APPS[ZmApp.PREFERENCES] == null) || !ZmApp.ENABLED_APPS[ZmApp.PREFERENCES]) {
      return;
    }
    const reg = new XRegExp(Setting.IM_USR_PREF_GROUP_DATA);
    const emptyValue = `01${JSON3.stringify([])}`;
    const properties: UserProperty[] = (this.zimletContext.xmlObj() as ZmZimletContext).userProperties;
    let propertyFound: boolean = false;
    for (const property of properties) {
      if (reg.test(property.name)) {
        propertyFound = true;
        if (property.name === Setting.IM_USR_PREF_GROUP_DATA) {
          property.value = emptyValue;
        } else {
          property.value = "";
        }
      }
    }
    if (propertyFound) {
      this.zimletContext.saveUserProperties(
        new AjxCallback(this, () => this.Log.warn([], "Group data reset")),
      );
    } else {
      this.set(Setting.IM_USR_PREF_GROUP_DATA, emptyValue, Callback.NOOP);
    }

  }

  public loadGroupsData(): IGroupData[] {
    if ((ZmApp.ENABLED_APPS[ZmApp.PREFERENCES] == null) || !ZmApp.ENABLED_APPS[ZmApp.PREFERENCES]) {
      return;
    }
    const tmpString: string = this.get(Setting.IM_USR_PREF_GROUP_DATA);
    const buffer: string[] = [];
    let slices: number = 0;
    let reset: boolean = false;
    let slicesString: string;
    try {
      slicesString = tmpString.slice(0, 2);
      buffer.push(tmpString.slice(2));
      slices = parseInt(slicesString, 10);
    } catch (error) {
      reset = true;
    }
    if (!reset && slices > 1) {
      try {
        for (let i = 1; i <= slices; i += 1) {
          let sliceName: string;
          if (i < 10) {
            sliceName = Setting.IM_USR_PREF_GROUP_DATA + "_0" + i;
          } else {
            sliceName = Setting.IM_USR_PREF_GROUP_DATA + "_" + i;
          }
          buffer.push(this.get(sliceName));
        }
      } catch (error) {
        this.Log.err(error, "Groups data handling error");
        reset = true;
      }
    }
    if (!reset) {
      try {
        const data = JSON3.parse(buffer.join(""));
        this.Log.debug(data, "Groups data loaded");
        return data;
      } catch (error) {
        reset = true;
      }
    }
    if (reset) {
      try {
        this.resetGroupsData();
      } catch (error) {}
    }
    return [];
  }

  private _onSet(key: string, val: any, callback: Callback): void {
    this.Log.debug({
      prop: key,
      value: val,
    }, "Property value set");
    const newValue = this.get(key);
    if (this.onChangeCallbacks.hasOwnProperty(key)) {
      this.onChangeCallbacks[key].run(newValue);
    }
    if (typeof callback !== "undefined") {
      callback.run(newValue);
    }
  }

  /**
   * Get the correct handler (or the default handler) for a setting.
   */
  private _getSettingHandler(key: string): ISettingsHandlerInterface {
    for (const hdlr of this.settingsHandlers) {
      if (hdlr.isSettingHandled(key)) {
        return hdlr;
      }
    }
    return this.defaultSettingsHandler;
  }

  /**
   * Cleanup the value which will be stored into the properties.
   */
  private _cleanGetValue(val: any): any {
    if (val === "true" || val === "TRUE") {
      val = true;
    } else if (val === "false" || val === "FALSE") {
      val = false;
    }
    return val;
  }

  /**
   * Cleanup the value which was retrieved from the properties.
   */
  private _cleanSetValue(val: any): any {
    if (val === true) {
      val = "TRUE";
    } else if (val === false) {
      val = "FALSE";
    }
    return val;
  }

}

export interface IGroupData {
  name: string;
  expanded: boolean;
}
