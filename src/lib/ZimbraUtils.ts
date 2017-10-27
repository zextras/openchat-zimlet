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

import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {ZmSetting} from "../zimbra/zimbraMail/share/model/ZmSetting";
import {ZmSkin} from "../zimbra/zimbraMail/ZmSkin";

export class ZimbraUtils {

  public static isUniversalUI(): boolean {
    return (ZmSkin.hints.name === "harmony2")
      || (ZmSkin.hints.name === "clarity");
  }

  public static getZimbraMajorVersion(): number {
    if (typeof ZimbraUtils.ZIMBRA_VERSION !== "undefined" && ZimbraUtils.ZIMBRA_VERSION !== null) {
      const zimbraParts: string[] = ZimbraUtils.ZIMBRA_VERSION.split(".");
      return parseInt(zimbraParts[0], 10);
    }
    return 0;
  }

  public static getZimbraMinorVersion(): number {
    if (typeof ZimbraUtils.ZIMBRA_VERSION !== "undefined" && ZimbraUtils.ZIMBRA_VERSION !== null) {
      const zimbraParts: string[] = ZimbraUtils.ZIMBRA_VERSION.split(".");
      return zimbraParts.length > 0 ? parseInt(zimbraParts[1], 10) : 0;
    }
    return 0;
  }

  public static isZimbraVersionLessThan85(): boolean {
    return ZimbraUtils.getZimbraMajorVersion() < 8
      || (ZimbraUtils.getZimbraMajorVersion() === 8
        && ZimbraUtils.getZimbraMinorVersion() < 5);
  }

  private static ZIMBRA_VERSION: string = appCtxt.get(ZmSetting.CLIENT_VERSION);
}
