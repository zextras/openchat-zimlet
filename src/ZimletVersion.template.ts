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

/* tslint:disable */
import {Version} from "./lib/Version";

export class ZimletVersion {
  public static COMMIT: string  = "#COMMIT_DATA#";
  public static VERSION: string = "#VERSION#";
  public static ZIMLET_NAME: string = "#ZIMLET_NAME#";
  public static STABLE: boolean  = #IS_STABLE#;
  public static STAGING: boolean = #IS_STAGING#;
  public static TESTING: boolean = #IS_TESTING#;
  public static PACKAGE_NAME: string = "#PACKAGE_NAME#";

  public static getVersion(): Version {
    const version: Version = new Version(ZimletVersion.VERSION);
    version.setCommit(ZimletVersion.COMMIT);
    return version;
  }
}
