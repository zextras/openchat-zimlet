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

import {Bowser} from "../libext/bowser";

export class BrowserUtils {

  public static isFirefox(): boolean {
    return Bowser.firefox;
  }

  public static isChrome(): boolean {
    return Bowser.chrome;
  }

  public static isChromium(): boolean {
    return Bowser.chromium;
  }

  public static isSafari(): boolean {
    return Bowser.safari;
  }

  public static getMajorVersion(): number {
    return parseInt(Bowser.version.substring(0, Bowser.version.indexOf(".")), 10);
  }
}
