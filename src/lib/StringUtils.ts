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

import {AjxDateUtil} from "../zimbra/ajax/util/AjxDateUtil";
import {AjxMessageFormat} from "../zimbra/ajax/util/AjxText";

export class StringUtils {

  public static sTranslationMap: {[label: string]: string};

  public static setTranslationMap(zimletType: {[label: string]: string}) {
    StringUtils.sTranslationMap = zimletType;
  }

  /**
   * Return a translated string by label.
   * If is provided  substitutions array, this method provide to format the message.
   * @param {String} messageLabel
   * @param {string[]} [substitutions] substitutions
   * @return {String}
   */
  public static getMessage(messageLabel: string, substitutions: string[] = []): string {
    let message: string = messageLabel;
    try {
      if (
        typeof StringUtils.sTranslationMap !== "undefined"
        && StringUtils.sTranslationMap.hasOwnProperty(messageLabel)
      ) {
        message = AjxMessageFormat.format(StringUtils.sTranslationMap[messageLabel], substitutions);
      }
    } catch (error) {
      return messageLabel;
    }
    return message;
  }

  public static trim(input: string): string {
    return input.replace(/^\s*/, "").replace(/\s*$/, "");
  }

  public static localizeHour(date: Date, now: Date): string {
    let hours: number;
    let minutes: number;
    let tmpHour: number;
    let hourString: string;
    let minutesString: string;

    now.setHours(0, 0, 0, 0);
    hours = date.getHours();
    minutes = date.getMinutes();
    if (now.getTime() > date.getTime()) {
      // Return the yesterday's date
      return date.getDate() + "/" + (date.getMonth() +  1) + "/" + date.getFullYear();
    } else {
      // Return the hour
      minutesString = ((minutes < 10) ? "0" : "") + minutes;
      if (AjxDateUtil.isLocale24Hour()) {
        hourString = ((hours < 10) ? "0" : "") + hours;
        return hourString + ":" + minutesString;
      } else {
        tmpHour = (hours < 13) ? hours : (hours - 12);
        tmpHour = (tmpHour < 1) ? 12 : tmpHour;
        return tmpHour + ":" + minutesString + " " + ((hours < 12) ? "AM" : "PM");
      }
    }
  }

  public static capitalizeFirstLetter(originalString: string): string {
    return originalString.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
  }

  public static manipulateStyle(originalStyle: string, originalClass: string, currentClass: string): string {
    const manipulatedStyle: string[] = [];
    const lines: string[] = originalStyle.split("\n");
    for (const line of lines) {
      /* Atm we need to extract only lines related to Object class */
      if (line.indexOf(".Object") !== -1 && line.indexOf(originalClass) !== -1) {
        manipulatedStyle.push(line.replace(new RegExp(originalClass, "g"), currentClass));
      }
    }
    return manipulatedStyle.join("\n");
  }
}
