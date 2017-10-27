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
import {ZmZimletContext} from "../zimbra/zimbraMail/share/model/ZmZimletContext";

export class SidebarUtils {

  private static BLACKLIST: string[] = [
    "ca_uoguelph_ccs_sidebar",
  ];

  public isSidebarUsed(): boolean {
    return this.thereIsSomeBlacklisted() || this.isSidebarReallyUsed();
  }

  private thereIsSomeBlacklisted(): boolean {
    const zimlets: ZmZimletContext[] = appCtxt.getZimletMgr().getZimlets();
    for (const zmCtxt of zimlets) {
      for (const zmName of SidebarUtils.BLACKLIST) {
        if (zmCtxt.name === zmName) {
          return true;
        }
      }
    }
    return false;
  }

  private isSidebarReallyUsed(): boolean {
    return false;
  }

}
