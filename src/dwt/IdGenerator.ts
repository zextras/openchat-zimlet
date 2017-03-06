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

import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";

export class IdGenerator {

  private static sLastId: number = 0;

  /**
   * Generate a DWT compatible ID for an HTML element, following the MDN standards.
   * @param {string=} part Part to append to the generated element (will be sanitized).
   * @return {string}
   */
  public static generateId(part: string = ""): string {
    let dwtId: string, sanitizedPart: string;
    if (typeof Dwt === "undefined") {
      dwtId = "IdGenerator_" + (++IdGenerator.sLastId);
    }
    else {
      dwtId = Dwt.getNextId();
    }
    sanitizedPart = IdGenerator.sanitizePart(part);
    if (part === "") {
      return dwtId;
    }
    else {
      return dwtId + "_" + sanitizedPart;
    }
  }

  /**
   * Sanitize a part before the use to generate an HTML element ID.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id
   * @param {string} part
   * @return {string} the sanitized part.
   */
  private static sanitizePart(part: string): string {
    return part.replace(/[^A-Za-z0-9\._-]/g, "_");
  }
}
