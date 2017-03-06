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

import {Setting} from "../Setting";
import {SettingsHandlerInterface} from "./SettingsHandlerInterface";
import {Callback} from "../../lib/callbacks/Callback";
import {ZmSettings} from "../../zimbra/zimbraMail/share/model/ZmSettings";
import {SettingsUtils} from "../SettingsUtils";
import {ZmSetting} from "../../zimbra/zimbraMail/share/model/ZmSetting";
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";

export class PreferencesHandler implements SettingsHandlerInterface {

  private mSettings: ZmSettings;

  constructor(settings: ZmSettings) {
    this.mSettings = settings;
    PreferencesHandler._registerSettings(this.mSettings);
    PreferencesHandler._populateSettings(this.mSettings);
  }

  public set(key: string, value: string|number, callback: Callback): void {
    let setting: ZmSetting = this.mSettings.getSetting(key);
    if (typeof setting !== "undefined" && setting !== null) {
      setting.setValue(value);
      this.mSettings.save([setting], new AjxCallback(callback, callback.run));
    }
  }

  public get(key: string): any {
    try {
      let setting = this.mSettings.getSetting(key);
      if (typeof setting !== "undefined" && setting !== null) {
        return setting.getValue();
      }
    } catch (ignored) {}
    return null;
  }

  public settingsHandled(): string[] {
    return [
      Setting.IM_PREF_NOTIFY_SOUNDS,
      Setting.IM_PREF_FLASH_BROWSER,
      Setting.IM_PREF_DESKTOP_ALERT,
      Setting.IM_PREF_INSTANT_NOTIFY,
      Setting.IM_PREF_AUTO_LOGIN,
      Setting.IM_PREF_NOTIFY_PRESENCE,
      Setting.IM_PREF_NOTIFY_STATUS,
      Setting.IM_PREF_LOGCHATS_ENABLED,
      Setting.IM_PREF_REPORT_IDLE,
      Setting.IM_PREF_IDLE_TIMEOUT,
      Setting.IM_PREF_IDLE_STATUS,
      Setting.IM_CUSTOM_STATUS_MRU,
      Setting.IM_PREF_BUDDY_SORT,
      Setting.IM_PREF_HIDE_OFFLINE,
      Setting.IM_PREF_HIDE_BLOCKED,
      Setting.MAIL_ALIASES,
      Setting.CONTACTS_ENABLED,
      Setting.GAL_ENABLED
    ];
  }

  public isSettingHandled(key: string): boolean {
    return SettingsUtils.isSettingHandled(key, this.settingsHandled());
  }

  /**
   * Register the settings used by the preference manager.
   * Register also a callback which will be called if some settings will change.
   * These settings may not be defined on wev interface, but they are defined in the LDAP schema.
   */
  private static _registerSettings(settings: ZmSettings): void {
    settings.registerSetting(Setting.IM_PREF_NOTIFY_SOUNDS, {
      name: "zimbraPrefIMSoundsEnabled",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_FLASH_BROWSER, {
      name: "zimbraPrefIMFlashTitle",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_DESKTOP_ALERT, {
      name: "zimbraPrefIMToasterEnabled",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_INSTANT_NOTIFY, {
      name: "zimbraPrefIMInstantNotify",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_AUTO_LOGIN, {
      name: "zimbraPrefIMAutoLogin",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: false
    });
    settings.registerSetting(Setting.IM_PREF_NOTIFY_PRESENCE, {
      name: "zimbraPrefIMNotifyPresence",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_NOTIFY_STATUS, {
      name: "zimbraPrefIMNotifyStatus",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_LOGCHATS_ENABLED, {
      name: "zimbraPrefIMLogChats",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_REPORT_IDLE, {
      name: "zimbraPrefIMReportIdle",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_IDLE_TIMEOUT, {
      name: "zimbraPrefIMIdleTimeout",
      type: Setting.T_PREF,
      dataType: Setting.D_INT,
      defaultValue: 10
    });
    settings.registerSetting(Setting.IM_PREF_IDLE_STATUS, {
      name: "zimbraPrefIMIdleStatus",
      type: Setting.T_PREF,
      dataType: Setting.D_STRING,
      defaultValue: "xa"
    });
    settings.registerSetting(Setting.IM_CUSTOM_STATUS_MRU, {
      name: "zimbraPrefIMCustomStatusMessage",
      type: Setting.T_PREF,
      dataType: Setting.D_LIST
    });
    settings.registerSetting(Setting.IM_PREF_BUDDY_SORT, {
      name: "zimbraPrefIMBuddyListSort",
      type: Setting.T_PREF,
      dataType: Setting.D_STRING,
      defaultValue: Setting.BUDDY_SORT_NAME
    });
    settings.registerSetting(Setting.IM_PREF_HIDE_OFFLINE, {
      name: "zimbraPrefIMHideOfflineBuddies",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: true
    });
    settings.registerSetting(Setting.IM_PREF_HIDE_BLOCKED, {
      name: "zimbraPrefIMHideBlockedBuddies",
      type: Setting.T_PREF,
      dataType: Setting.D_BOOLEAN,
      defaultValue: false
    });
  }


  /**
   * The setting we have added are not populated by default, retrieve te values from
   * the last GetInfo Request.
   */
  private static _populateSettings(settings: ZmSettings): void {
    let lastResponse;
    lastResponse = settings.getInfoResponse.prefs._attrs;
    settings.getSetting(Setting.IM_PREF_NOTIFY_SOUNDS).setValue(lastResponse.zimbraPrefIMSoundsEnabled);
    settings.getSetting(Setting.IM_PREF_FLASH_BROWSER).setValue(lastResponse.zimbraPrefIMFlashTitle);
    settings.getSetting(Setting.IM_PREF_DESKTOP_ALERT).setValue(lastResponse.zimbraPrefIMToasterEnabled);
    settings.getSetting(Setting.IM_PREF_INSTANT_NOTIFY).setValue(lastResponse.zimbraPrefIMInstantNotify);
    settings.getSetting(Setting.IM_PREF_AUTO_LOGIN).setValue(lastResponse.zimbraPrefIMAutoLogin);
    settings.getSetting(Setting.IM_PREF_NOTIFY_PRESENCE).setValue(lastResponse.zimbraPrefIMNotifyPresence);
    settings.getSetting(Setting.IM_PREF_NOTIFY_STATUS).setValue(lastResponse.zimbraPrefIMNotifyStatus);
    settings.getSetting(Setting.IM_PREF_LOGCHATS_ENABLED).setValue(lastResponse.zimbraPrefIMLogChats);
    // settings.getSetting().setValue(req.GetInfoResponse.prefs._attrs.zimbraPrefIMLogChatsEnabled)
    settings.getSetting(Setting.IM_PREF_REPORT_IDLE).setValue(lastResponse.zimbraPrefIMReportIdle);
    settings.getSetting(Setting.IM_PREF_IDLE_TIMEOUT).setValue(lastResponse.zimbraPrefIMIdleTimeout);
    settings.getSetting(Setting.IM_PREF_IDLE_STATUS).setValue(lastResponse.zimbraPrefIMIdleStatus);
    // zimbraPrefIMCustomStatusMessage
    settings.getSetting(Setting.IM_PREF_BUDDY_SORT).setValue(lastResponse.zimbraPrefIMBuddyListSort);
    settings.getSetting(Setting.IM_PREF_HIDE_OFFLINE).setValue(lastResponse.zimbraPrefIMHideOfflineBuddies);
    settings.getSetting(Setting.IM_PREF_HIDE_BLOCKED).setValue(lastResponse.zimbraPrefIMHideBlockedBuddies);
  }

}
