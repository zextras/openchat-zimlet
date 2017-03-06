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

import {Callback} from "../callbacks/Callback";

export class DesktopNotificationFactory {

  public static GRANTED: string = "granted";
  public static DENIED: string = "denied";
  public static DEFAULT: string = "default";

  public static getNotification(title: string,
                                options?: NotificationOptions): Notification {
    if (!!window && "Notification" in window)
      return new Notification(title, options);
  }

  public static getPermission(): string {
    if (!!window && "Notification" in window) {
      return Notification.permission;
    }
    else {
      return "";
    }
  }

  public static requestPermission(callback?: Callback): Promise<any> {
    if (!!window && "Notification" in window) {
      return Notification.requestPermission().then(callback.toClosure());
    }
  }

}

declare let Notification: {
  prototype: Notification;
  permission: string;
  new(title: string, options?: NotificationOptions): Notification;
  requestPermission(callback?: NotificationPermissionCallback): Promise<string>;
};
