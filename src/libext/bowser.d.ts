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

export declare class Bowser {
  public static firefox: boolean;
  public static chrome: boolean;
  public static opera: boolean;
  public static msie: boolean;
  public static msedge: boolean;
  public static chromium: boolean;
  public static safari: boolean;
  public static version: string;

  /**
   * Check if browser is unsupported
   *
   * @example
   *   bowser.isUnsupportedBrowser({
   *     msie: "10",
   *     firefox: "23",
   *     chrome: "29",
   *     safari: "5.1",
   *     opera: "16",
   *     phantom: "534"
   *   });
   *
   * @param browsers {any}  minVersions map of minimal version to browser
   * @param strictMod {Boolean} [strictMod = false] flag to return false if browser wasn't found in map
   * @param userAgent {string} [ua] user agent string
   * @return {Boolean}
   */
  public static isUnsupportedBrowser(
    browsers: {
      msie?: string,
      firefox?: string,
      chrome?: string,
      safari?: string,
      opera?: string,
      phantom?: string,
    },
    strictMod?: boolean,
    userAgent?: string,
  ): boolean;
}
