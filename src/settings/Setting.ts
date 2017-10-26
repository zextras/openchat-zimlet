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

export class Setting {

  public static T_PREF: string = "pref";
  public static D_STRING: string = "string"; // default type
  public static D_INT: string = "int";
  public static D_BOOLEAN: string = "boolean";
  public static D_LDAP_TIME: string = "ldap_time";
  public static D_HASH: string = "hash";
  public static D_LIST: string = "list";
  public static D_NONE: string = "NONE"; // placeholder setting
  public static _DATA_CHUNK_SIZE: number = 1024;
  public static _DATA_CHUNK_PREFIX: number = 53;
  public static BUDDY_SORT_NAME: string = "name";
  public static BUDDY_SORT_PRESENCE: string = "presence";
  public static IM_PREF_NOTIFY_SOUNDS: string = "IM_PREF_NOTIFY_SOUNDS";
  public static IM_PREF_FLASH_BROWSER: string = "IM_PREF_FLASH_BROWSER";
  public static IM_PREF_DESKTOP_ALERT: string = "IM_PREF_DESKTOP_ALERT";
  public static IM_PREF_INSTANT_NOTIFY: string = "IM_PREF_INSTANT_NOTIFY";
  public static IM_PREF_AUTO_LOGIN: string = "IM_PREF_AUTO_LOGIN";
  public static IM_PREF_NOTIFY_PRESENCE: string = "IM_PREF_NOTIFY_PRESENCE";
  public static IM_PREF_NOTIFY_STATUS: string = "IM_PREF_NOTIFY_STATUS";
  public static IM_PREF_LOGCHATS_ENABLED: string = "IM_PREF_LOGCHATS_ENABLED";
  public static IM_PREF_REPORT_IDLE: string = "IM_PREF_REPORT_IDLE";
  public static IM_PREF_IDLE_TIMEOUT: string = "IM_PREF_IDLE_TIMEOUT";
  public static IM_PREF_IDLE_STATUS: string = "IM_PREF_IDLE_STATUS";
  public static IM_CUSTOM_STATUS_MRU: string = "IM_CUSTOM_STATUS_MRU";
  public static IM_PREF_BUDDY_SORT: string = "IM_PREF_BUDDY_SORT";
  public static IM_PREF_HIDE_OFFLINE: string = "IM_PREF_HIDE_OFFLINE";
  public static IM_PREF_HIDE_BLOCKED: string = "IM_PREF_HIDE_BLOCKED";
  public static IM_USR_PREF_DOCK: string = "zxchat_pref_dockmode";
  public static IM_USR_PREF_DOCK_UP: string = "zxchat_pref_dockmode_up";
  public static IM_USR_PREF_EMOJI_IN_CONV: string = "zxchat_pref_emoji_in_conv";
  public static IM_USR_PREF_EMOJI_IN_HIST: string = "zxchat_pref_emoji_in_hist";
  public static IM_USR_PREF_EMOJI_IN_MAIL: string = "zxchat_pref_emoji_in_mail";
  public static IM_USR_PREF_LAST_STATUS: string = "zxchat_pref_last_status";
  public static IM_USR_PREF_URL_IN_CONV: string = "zxchat_pref_url_in_conv";
  public static IM_USR_PREF_URL_IN_HIST: string = "zxchat_pref_url_in_hist";
  public static IM_USR_PREF_URL_IN_MAIL: string = "zxchat_pref_url_in_mail";
  public static IM_USR_PREF_ASSISTANT: string = "zxchat_pref_assistant";
  public static IM_USR_PREF_SHOW_DEBUG_INFO: string = "zxchat_pref_show_debug_info";
  public static ENABLE_ERROR_REPORT: string = "report_errors";
  public static IM_USR_PREF_GROUP_DATA: string = "IM_ZIMLET_GROUP_DATA";
  public static CONTACTS_ENABLED: string = "CONTACTS_ENABLED";
  public static GAL_ENABLED: string = "GAL_ENABLED";
  public static MAIL_ALIASES: string = "MAIL_ALIASES";
  public static TURN_URL: string = "turnUrl";
  public static TURN_CREDENTIAL: string = "turnCredential";
  public static TURN_USERNAME: string = "turnUsername";

}
