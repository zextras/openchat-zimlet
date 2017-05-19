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

import {AjxMessageFormat} from "../zimbra/ajax/util/AjxText";
import {AjxDateUtil} from "../zimbra/ajax/util/AjxDateUtil";

declare const com_zextras_zextras: {[label: string]: string};
declare const com_zextras_zxmig: {[label: string]: string};
declare const com_zextras_chat: {[label: string]: string};
declare const com_zextras_chat_testing: {[label: string]: string};
declare const com_zextras_chat_open: {[label: string]: string};

export class StringUtils {
  /**
   * Return a translated string by label.
   * If is provided  substitutions array, this method provide to format the message.
   * @param {String} messageLabel
   * @param {string[]} [substitutions] substitutions
   * @return {String}
   */
  public static getMessage(messageLabel: string, substitutions: string[] = []): string {
    let message: string = messageLabel,
      translation: string;
    try {
      if (typeof com_zextras_zextras !== "undefined" && com_zextras_zextras.hasOwnProperty(messageLabel)) {
        message = AjxMessageFormat.format(com_zextras_zextras[messageLabel], substitutions);
      }
      if (typeof com_zextras_zxmig !== "undefined" && com_zextras_zxmig.hasOwnProperty(messageLabel)) {
        message = AjxMessageFormat.format(com_zextras_zxmig[messageLabel], substitutions);
      }
      if (typeof com_zextras_chat !== "undefined" && com_zextras_chat.hasOwnProperty(messageLabel)) {
        message = AjxMessageFormat.format(com_zextras_chat[messageLabel], substitutions);
      }
      if (typeof com_zextras_chat_testing !== "undefined" && com_zextras_chat_testing.hasOwnProperty(messageLabel)) {
        message = AjxMessageFormat.format(com_zextras_chat_testing[messageLabel], substitutions);
      }
      if (typeof com_zextras_chat_open !== "undefined" && com_zextras_chat_open.hasOwnProperty(messageLabel)) {
        message = AjxMessageFormat.format(com_zextras_chat_open[messageLabel], substitutions);
      }
    }
    catch (error) {
      return messageLabel;
    }
    return message;
  }

  public static trim(input: string): string {
    return input.replace(/^\s+|\s+$/gm, "");
  }

  public static localizeHour(date: Date, now: Date): string {
    let hours: number,
      minutes: number,
      tmpHour: number,
      hourString: string,
      minutesString: string;

    now.setHours(0, 0, 0, 0);
    hours = date.getHours();
    minutes = date.getMinutes();
    if (now.getTime() > date.getTime()) {
      // Return the yesterday's date
      return date.getDate() + "/" + (date.getMonth() +  1) + "/" + date.getFullYear();
    }
    else {
      // Return the hour
      minutesString = ((minutes < 10) ? "0" : "") + minutes;
      if (AjxDateUtil.isLocale24Hour()) {
        hourString = ((hours < 10) ? "0" : "") + hours;
        return hourString + ":" + minutesString;
      }
      else {
        tmpHour = (hours < 13) ? hours : (hours - 12);
        tmpHour = (tmpHour < 1) ? 12 : tmpHour;
        return tmpHour + ":" + minutesString + " " + ((hours < 12) ? "AM" : "PM");
      }
    }
  }

  public static capitalizeFirstLetter(originalString: string): string {
    return originalString.replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  }

  public static manipulateStyle(originalStyle: string, originalClass: string, currentClass: string): string {
    let manipulatedStyle: string[] = [];
    let lines: string[] = originalStyle.split("\n");
    for (let i = 0; i < lines.length; i++) {
      /* Atm we need to extract only lines related to Object class */
      if (lines[i].indexOf(".Object") !== -1 && lines[i].indexOf(originalClass) !== -1)
        manipulatedStyle.push(lines[i].replace(new RegExp(originalClass, "g"), currentClass));
    }
    return manipulatedStyle.join("\n");
  }
}