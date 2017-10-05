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
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";
import {ZmSetting} from "../../zimbra/zimbraMail/share/model/ZmSetting";
import {ZmSettings} from "../../zimbra/zimbraMail/share/model/ZmSettings";
import {Setting} from "../Setting";
import {SettingsUtils} from "../SettingsUtils";
import {ISettingsHandlerInterface} from "./SettingsHandlerInterface";

export class PreferencesHandler implements ISettingsHandlerInterface {

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

  /**
   * Register the settings used by the preference manager.
   * Register also a callback which will be called if some settings will change.
   * These settings may not be defined on wev interface, but they are defined in the LDAP schema.
   */
  private static _registerSettings(settings: ZmSettings): void {
    settings.registerSetting(Setting.IM_PREF_NOTIFY_SOUNDS, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMSoundsEnabled",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_FLASH_BROWSER, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMFlashTitle",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_DESKTOP_ALERT, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMToasterEnabled",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_INSTANT_NOTIFY, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMInstantNotify",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_AUTO_LOGIN, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: false,
      name: "zimbraPrefIMAutoLogin",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_NOTIFY_PRESENCE, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMNotifyPresence",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_NOTIFY_STATUS, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMNotifyStatus",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_LOGCHATS_ENABLED, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMLogChats",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_REPORT_IDLE, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMReportIdle",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_IDLE_TIMEOUT, {
      dataType: Setting.D_INT,
      defaultValue: 10,
      name: "zimbraPrefIMIdleTimeout",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_IDLE_STATUS, {
      dataType: Setting.D_STRING,
      defaultValue: "xa",
      name: "zimbraPrefIMIdleStatus",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_CUSTOM_STATUS_MRU, {
      dataType: Setting.D_LIST,
      name: "zimbraPrefIMCustomStatusMessage",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_BUDDY_SORT, {
      dataType: Setting.D_STRING,
      defaultValue: Setting.BUDDY_SORT_NAME,
      name: "zimbraPrefIMBuddyListSort",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_HIDE_OFFLINE, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: true,
      name: "zimbraPrefIMHideOfflineBuddies",
      type: Setting.T_PREF,
    });
    settings.registerSetting(Setting.IM_PREF_HIDE_BLOCKED, {
      dataType: Setting.D_BOOLEAN,
      defaultValue: false,
      name: "zimbraPrefIMHideBlockedBuddies",
      type: Setting.T_PREF,
    });
  }

  private mSettings: ZmSettings;

  constructor(settings: ZmSettings) {
    this.mSettings = settings;
    PreferencesHandler._registerSettings(this.mSettings);
    PreferencesHandler._populateSettings(this.mSettings);
  }

  public set(key: string, value: string|number, callback: Callback): void {
    const setting: ZmSetting = this.mSettings.getSetting(key);
    if (typeof setting !== "undefined" && setting !== null) {
      setting.setValue(value);
      this.mSettings.save([setting], new AjxCallback(callback, callback.run));
    }
  }

  public get(key: string): any {
    try {
      const setting = this.mSettings.getSetting(key);
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
      Setting.GAL_ENABLED,
    ];
  }

  public isSettingHandled(key: string): boolean {
    return SettingsUtils.isSettingHandled(key, this.settingsHandled());
  }

}
