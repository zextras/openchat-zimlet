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

import {ZxErrorCode} from "./ZxErrorCode";
export class ZxError extends Error {

  private static KEY_CODE = "code";
  private static KEY_DETAILS = "details";
  private static KEY_MESSAGE = "message";
  private static KEY_STACKTRACE = "stackTrace";
  private static KEY_CAUSE = "cause";
  private static KEY_ERROR_TIME = "time";

  private static UNKNOWN_JS_EXCEPTION_CODE = "UNKNOWN_JS_EXCEPTION";
  private static UNKNOWN_JS_EXCEPTION_MSG = "JavaScript Exception: {details}";

  private mTime: number;

  constructor(code: string = ZxError.UNKNOWN_JS_EXCEPTION_CODE, cause?: Error) {
    /* All comments are skipped in typescript translation: (code instanceof Error) no more accepted*/
    // if not cause? and code instanceof Error
    //   cause = code
    //   code = null

    // if typeof code == "string" {
    if ((typeof ZxErrorCode !== "undefined" && ZxErrorCode !== null) && !ZxErrorCode.hasOwnProperty(code) && !/test/ig.test(code)) {
      code = ZxErrorCode.GENERIC_ERROR;
    }
    // }else if code instanceof Error or code.toString() == "AjxException" {
    //   cause = code
    //   code = ZxErrorCode.UNKNOWN_JS_EXCEPTION
    // } else {
    //   throw new TypeError("Unknown Error type")}
    super();
    this.mTime = new Date().getTime();
  }
}
