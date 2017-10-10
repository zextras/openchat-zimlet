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
import {printStackTrace, TraceLine} from "../../libext/stacktrace-js";
import {JSON3} from "../../libext/json3";
import {AjxException} from "../../zimbra/ajax/core/AjxException";
import {XRegExp} from "../../libext/xregexp";
export class ZxError extends Error {

  private static KEY_CODE = "code";
  private static KEY_DETAILS = "details";
  private static KEY_MESSAGE = "message";
  private static KEY_STACKTRACE = "stackTrace";
  private static KEY_CAUSE = "cause";
  private static KEY_ERROR_TIME = "time";

  private static UNKNOWN_JS_EXCEPTION_CODE = "UNKNOWN_JS_EXCEPTION";
  private static UNKNOWN_JS_EXCEPTION_MSG  = "JavaScript Exception: {details}";

  private mTime: number;
  private mCause: Error;
  private mCode: string;
  private mMessage: string;
  private mIsException: boolean;
  private mDetails: {[detail: string]: string};
  private mTrace: TraceLine[];

  constructor(code?: string, cause?: Error) {
    if (code == null) {
      code = ZxError.UNKNOWN_JS_EXCEPTION_CODE;
    }

    if (typeof code === "string") {
      if ((typeof ZxErrorCode !== "undefined" && ZxErrorCode !== null) && !ZxErrorCode.hasOwnProperty(code) && !/test/ig.test(code)) {
        code = ZxErrorCode.GENERIC_ERROR;
      }
    }
    super(code);
    ZxError.prototype.loadPrototype.apply(this);
    this.mTime = new Date().getTime();

    if (typeof cause !== "undefined" && cause !== null) {
      this.initCause(cause);
    } else {
      this.mCause = null;
    }

    this.name = "ZxError";
    this.mCode = code;
    this.mMessage = code;
    if ((typeof ZxErrorCode !== "undefined" && ZxErrorCode !== null) &&
      (typeof ZxErrorCode.getMessage !== "undefined" && ZxErrorCode.getMessage !== null)) {
      this.mMessage = ZxErrorCode.getMessage(code);
    }
    this.mIsException = false;
    this.mDetails = {};
    this.mTrace = printStackTrace();
  }

  // WARNING: Each prototype method must be added here
  public loadPrototype(): void {
    this.toJSON = ZxError.prototype.toJSON;
    this.initCause = ZxError.prototype.initCause;
    this.setMessage = ZxError.prototype.setMessage;
    this.getMessage = ZxError.prototype.getMessage;
    this.setCode = ZxError.prototype.setCode;
    this.getCode = ZxError.prototype.getCode;
    this.setDetails = ZxError.prototype.setDetails;
    this.setDetail = ZxError.prototype.setDetail;
    this.getDetails = ZxError.prototype.getDetails;
    this.getDetail = ZxError.prototype.getDetail;
    this.isException = ZxError.prototype.isException;
    this.isError = ZxError.prototype.isError;
    this.setIsException = ZxError.prototype.setIsException;
    this.setIsError = ZxError.prototype.setIsError;
    this.setStackTrace = ZxError.prototype.setStackTrace;
    this.getStackTrace = ZxError.prototype.getStackTrace;
    this.setTime = ZxError.prototype.setTime;
    this.getTime = ZxError.prototype.getTime;
    this.getCause = ZxError.prototype.getCause;
    this.toString = ZxError.prototype.toString;
  }

  public toJSON(): {[property: string]: any} {
    let i, len, obj: {[property: string]: any}, ref, trace, traceEl: TraceLine, traceJson: TraceLine;
    obj = {};
    obj[ZxError.KEY_CODE] = this.mCode;
    obj[ZxError.KEY_MESSAGE] = this.mMessage;
    obj[ZxError.KEY_ERROR_TIME] = this.mTime;
    obj[ZxError.KEY_DETAILS] = this.mDetails;
    trace = [];
    ref = this.mTrace;
    for (i = 0, len = ref.length; i < len; i++) {
      traceEl = ref[i];
      traceJson = {
        className: "" + traceEl.className,
        fileName: "" + traceEl.fileName,
        lineNumber: traceEl.lineNumber || 0,
        methodName: "" + traceEl.methodName,
        nativeMethod: traceEl.nativeMethod || false
      };
      if (typeof traceEl.character !== "undefined" && traceEl.character !== null) {
        traceJson.character = traceEl.character;
      }
      trace.push(traceJson);
    }
    obj[ZxError.KEY_STACKTRACE] = trace;
    if (typeof this.mCause !== "undefined" && this.mCause !== null) {
      obj[ZxError.KEY_CAUSE] = (<ZxError>this.mCause).toJSON();
    } else {
      obj[ZxError.KEY_CAUSE] = null;
    }
    return obj;
  }

  public initCause(cause: Error): ZxError {
    if (cause instanceof ZxError) {
      this.mCause = cause;
    } else if ((typeof cause.toString !== "undefined" && cause.toString !== null) && cause.toString() === "AjxException") {
      this.mCause = ZxError.convertError(cause);
    } else if (cause instanceof Error) {
      this.mCause = ZxError.convertError(cause);
    }
    return this;
  }

  private setMessage(message: string): ZxError {
    this.mMessage = message;
    return this;
  }

  public getMessage(br: string = "<br>"): string {
    let message: string = this.mMessage;
    for (let key in this.mDetails) {
      if (this.mDetails.hasOwnProperty(key)) {
        message = message.replace(`{${key}}`, this.mDetails[key]);
      }
    }
    return message.replace(/\n/mg, br);
  }

  public setCode(code: string): ZxError {
    if (typeof ZxErrorCode !== "undefined" && ZxErrorCode !== null) {
      if (!ZxErrorCode.hasOwnProperty(code)) {
        code = ZxErrorCode.UNKNOWN_ERROR;
      }
    }
    this.mCode = code;
    if ((typeof ZxErrorCode !== "undefined" && ZxErrorCode !== null) &&
      (typeof ZxErrorCode.getMessage(code) !== "undefined" && ZxErrorCode.getMessage(code) !== null)) {
      this.mMessage = ZxErrorCode.getMessage(code);
    }
    return this;
  }

  public getCode(): string {
    return this.mCode;
  }

  public setDetails(details: {[detail: string]: string}): ZxError {
    this.mDetails = details;
    return this;
  }

  public setDetail(key: string, value: string): ZxError {
    this.mDetails[key] = value;
    return this;
  }

  public getDetails(): {[detail: string]: string} {
    return this.mDetails;
  }

  public getDetail(key: string): string {
    return this.mDetails[key];
  }

  public isException(): boolean {
    return this.mIsException;
  }

  public isError(): boolean {
    return !this.mIsException;
  }

  public setIsException(): ZxError {
    this.mIsException = true;
    return this;
  }

  public setIsError(): ZxError {
    this.mIsException = false;
    return this;
  }

  public setStackTrace(trace: TraceLine[]): ZxError {
    this.mTrace = trace;
    return this;
  }

  public getStackTrace(): TraceLine[] {
    return this.mTrace;
  }

  public setTime(time: number): ZxError {
    this.mTime = time;
    return this;
  }

  public getTime(): number {
    return this.mTime;
  }

  public getCause(): ZxError {
    return <ZxError>this.mCause;
  }

  public static fromResponse(resp: {error?: any, exception?: any}): ZxError {
    let cause, error = new ZxError();
    if ((typeof resp !== "undefined" && resp !== null) && (typeof resp.error !== "undefined" && resp.error !== null)) {
      if (typeof resp.error === "string") {
        resp.error = JSON3.parse(resp.error);
      }
      error.setIsError();
      error.setCode(resp.error[ZxError.KEY_CODE]);
      error.setMessage(resp.error[ZxError.KEY_MESSAGE]);
      error.setDetails(resp.error[ZxError.KEY_DETAILS]);
      error.setStackTrace(resp.error[ZxError.KEY_STACKTRACE]);
      if (resp.error !== "undefined" && resp.error !== null) {
        cause = ZxError.convertError(resp.error);
        if (typeof cause !== "undefined" && cause !== null) {
          cause.setIsError();
          error = cause;
        }
      }
    }
    if ((typeof resp !== "undefined" && resp !== null) && (typeof resp.exception !== "undefined" && resp.exception !== null)) {
      if (typeof resp.exception === "string") {
        resp.exception = JSON3.parse(resp.exception);
      }
      error.setIsException();
      error.setCode(resp.exception[ZxError.KEY_CODE]);
      error.setDetails(resp.exception[ZxError.KEY_DETAILS]);
      error.setStackTrace(resp.exception[ZxError.KEY_STACKTRACE]);
      if (typeof resp.exception !== "undefined" && resp.exception !== null) {
        cause = ZxError.convertError(resp.exception);
        if (typeof cause !== "undefined" && cause !== null) {
          cause.setIsException();
          error = cause;
        }
      }
    }
    return error;
  }

  public static convertError(error: (Error|AjxException)&{[property: string]: any}): ZxError {
    let converted, ex;
    try {
      if (error instanceof ZxError) {
        return error;
      } else if ((typeof error.toString !== "undefined" && error.toString !== null) && error.toString() === "ZmCsfeException") {
        converted = new ZxError(ZxErrorCode.ZM_CSFE_EXCEPTION);
        converted.setDetails({
          code: error.code,
          msg: error.msg
        });
      } else if ((typeof error.toString !== "undefined" && error.toString !== null) && error.toString() === "AjxException") {
        converted = new ZxError(ZxErrorCode.AJX_EXCEPTION);
        converted.setDetails({
          details: error.msg
        });
        converted.setStackTrace(ZxError.buildStackTrace(error));
      } else if (error instanceof Error) {
        converted = new ZxError(ZxErrorCode.UNKNOWN_JS_EXCEPTION);
        converted.setDetails({
          details: error.message
        });
        converted.setStackTrace(ZxError.buildStackTrace(error));
      } else if (typeof error === "object") {
        converted = new ZxError();
        if (typeof error[ZxError.KEY_CODE] !== "undefined" && error[ZxError.KEY_CODE] !== null) {
          converted.setCode(error[ZxError.KEY_CODE]);
        }
        if (typeof error[ZxError.KEY_MESSAGE] !== "undefined" && error[ZxError.KEY_MESSAGE] !== null) {
          converted.setMessage(error[ZxError.KEY_MESSAGE]);
        }
        if (typeof error[ZxError.KEY_DETAILS] !== "undefined" && error[ZxError.KEY_DETAILS] !== null) {
          converted.setDetails(error[ZxError.KEY_DETAILS]);
        }
        if (typeof error[ZxError.KEY_STACKTRACE] !== "undefined" && error[ZxError.KEY_STACKTRACE] !== null) {
          converted.setStackTrace(error[ZxError.KEY_STACKTRACE]);
        }
        if (typeof error[ZxError.KEY_CAUSE] !== "undefined" && error[ZxError.KEY_CAUSE] !== null) {
          converted.initCause(ZxError.convertError(error[ZxError.KEY_CAUSE]));
        }
        if (typeof error[ZxError.KEY_ERROR_TIME] !== "undefined" && error[ZxError.KEY_ERROR_TIME] !== null) {
          converted.setTime(error[ZxError.KEY_ERROR_TIME]);
        } else {
          converted.setTime(new Date().getTime());
        }
      }
    } catch (error1) {
      ex = error1;
    }
    return converted;
  }

  public toString(html: boolean = false): string {
    let buffer, i, len, nativeStr, ref, row;
    if (html == null) {
      html = false;
    }
    buffer = [];
    if (html) {
      buffer.push("<pre>");
    }
    buffer.push((this.getMessage()) + "\n");
    ref = this.getStackTrace();
    for (i = 0, len = ref.length; i < len; i++) {
      row = ref[i];
      nativeStr = row.nativeMethod ? " [native]" : "";
      buffer.push(` at ${row.className}.${row.methodName} ( ${row.fileName}:${row.lineNumber} )${nativeStr}\n`);
    }
    if (typeof this.mCause !== "undefined" && this.mCause !== null) {
      buffer.push("Caused By: ");
      buffer.push(this.getCause().toString(html));
    }
    if (html) {
      buffer.push("</pre>");
    }
    return buffer.join("");
  }

  public static buildStackTrace(
    error: Error|ZxError|AjxException,
    mode?: "phantomjs"|"chrome"|"safari"|"ie"|"firefox"|"opera9"|"opera10a"|"opera10b"|"opera11"|"chrome"|"other"
  ): TraceLine[] {
    let err: Error, trace: TraceLine[] = [];
    if (mode == null) {
      mode = null;
    }
    if (error == null) {
      try {
        throw new Error("ZxError");
      } catch (error1) {
        err = error1;
        error = err;
      }
    }
    let emptyTraceLine: TraceLine = {
      fileName: "UnknownFile",
      lineNumber: 0,
      className: "Unknown",
      methodName: "Unknown",
      nativeMethod: false
    };

    let errorTraceLine: TraceLine = {
      fileName: "UnknownFile, cannot be parsed",
      lineNumber: 0,
      className: "Unknown",
      methodName: "Unknown",
      nativeMethod: false
    };

    if (error instanceof ZxError) {
      if ((typeof error.getStackTrace() !== "undefined" && error.getStackTrace() !== null) && error.getStackTrace().length > 0) {
        trace = error.getStackTrace();
      }
    } else if (
      error instanceof Error || ((typeof (<AjxException>error).toString !== "undefined" && (<AjxException>error).toString !== null) &&
      (<AjxException>error).toString() === "AjxException")
    ) {
      let stackStrings: TraceLine[] = printStackTrace({
        e: <Error> error,
        mode: mode
      });
      //
      // Example array lines of printStackTrace():
      //
      // Object.printStackTrace.implementation.createException@https://example.com:7071/service/.../js/lib/printStackTrace.js?v=130910130547:35:12
      // Object.exports.ZxErrorTest.ZxError new ZxError(Error)@/home/michele/ZeXtras/tests/js/common-libs/unit/ZxErrorTest.coffee:63:17
      // {anonymous}()@/home/michele/ZeXtras/build-commons/nodejs/lib/node_modules/nodeunit/deps/async.js:463:34
      // {anonymous}()@<anonymous>:463:34
      //
      //
      // Result of a match with regex:
      //
      // ClassName = 'Object.printStackTrace.implementation'
      // Method = 'createException'
      // FileName = 'printStackTrace.js'
      // Line = 35
      //
      //      regex = XRegExp(
      //        "
      //        (?:                          # Begin optional (present 1 or 0 times) grouping
      //          (?<ClassName>[^ ]+)        # Matches all characters != space and captures the match as "ClassName".
      //          \\.                        # Matches a literal '.'
      //        )?                           # End grouping
      //        (?:                          # Begin grouping
      //            \\{anonymous\\}\\(\\)    # Matches the literal '{anonymous}()'
      //          |                          # Alternation
      //            (?<Method>.+)            # Matches 1 or more characters and captures the result as "Method"
      //        )                            # End grouping
      //        @                            # Matches a literal '@'
      //        (?:                          # Begin grouping
      //            [^ ]+[^\\\\]/            # Matches all characters != space followed by a '/' character not preceded by '\'
      //            (?<FileName>[^ ?:]+)     # Matches all characters != space or '?' or ':' and captures the match as "FileName"
      //            (?:                      # Begin optional (present 1 or 0 times) grouping
      //              \\?[^ :]+              # Matches a literal '?' followed by 1+ characters != space or ':'
      //            )?                       # End grouping
      //          |                          # Alternation
      //            <anonymous>              # Matches a literal '<anonymous>'
      //        )                            # End grouping
      //        :                            # Matches a literal ':'
      //        (?<Line>\\d+)                # Matches 1+ digits and captures the match as "Line"
      //        :?(?<Character>\\d+)?        # Matches 1+ digits and captures the match as "Character"
      //        ",
      //        "x"
      //      )
      let regex: RegExp = new XRegExp("(?: (?<ClassName>[^ ]+) \\. )? (?: \\{anonymous\\}\\(\\) | (?<Method>.+) ) @ (?: [^ ]+[^\\\\]/ (?<FileName>[^ ?:]+) (?: \\?[^ :]+ )? | <anonymous> ) : (?<Line>\\d+) :?(?<Character>\\d+)?", "x");
      for (let i: number = 0, len: number = stackStrings.length; i < len; i++) {
        let oneMatch: TraceLine = stackStrings[i];
        try {
          let match: MatchedRegexp = XRegExp.exec(oneMatch, regex);
          if (typeof match !== "undefined" && match !== null) {
            let className: string = "Unknown";
            if (typeof match.ClassName !== "undefined" && match.ClassName !== null) {
              className = match.ClassName.replace(/^\{anonymous}\(\)@/g, "");
              className = className.replace(/\//g, ".");
            }
            let methodName: string = "Unknown";
            if (typeof match.Method !== "undefined" && match.Method !== null) {
              methodName = match.Method.replace(/\/</g, ".");
              methodName = methodName.replace(/\.*$/g, "");
            }
            trace.push({
              fileName: (typeof match.FileName !== "undefined" && match.FileName !== null) ? match.FileName : "Unknown",
              lineNumber: (typeof match.Line !== "undefined" && match.Line !== null) ? match.Line : 0,
              character: (typeof match.Character !== "undefined" && match.Character !== null) ? match.Character : "0",
              className: className,
              methodName: methodName,
              nativeMethod: false
            });
          } else {
            trace.push(errorTraceLine);
          }
        } catch (error1) {
          error = error1;
          trace.push(errorTraceLine);
        }
      }
      if (trace.length === 0) {
        trace[0] = emptyTraceLine;
      }
    }
    return trace;
  }
}

interface MatchedRegexp {
  ClassName: string;
  Method: string;
  FileName: string;
  Line: number;
  Character: string;
}