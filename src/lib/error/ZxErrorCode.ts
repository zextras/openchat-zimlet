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

export class ZxErrorCode {

  public static GENERIC_ERROR: string = "GENERIC_ERROR";
  public static CHAT_DB_EXCEPTION: string = "CHAT_DB_EXCEPTION";
  public static CHAT_SQL_EXCEPTION: string = "CHAT_SQL_EXCEPTION";
  public static CHAT_CONCURRENT_PING: string = "CHAT_CONCURRENT_PING";
  public static DELEGATED_OR_RESOURCES_NOT_ALLOWED_TO_CHAT: string = "DELEGATED_OR_RESOURCES_NOT_ALLOWED_TO_CHAT";
  public static CHAT_MESSAGE_SIZE_EXCEEDED: string = "CHAT_MESSAGE_SIZE_EXCEEDED";
  public static INVALID_CHAT_ACCOUNT: string = "INVALID_CHAT_ACCOUNT";
  public static NO_SUCH_CHAT_SESSION: string = "NO_SUCH_CHAT_SESSION";
  public static UNABLE_TO_START_MANDATORY_SERVICE: string = "UNABLE_TO_START_MANDATORY_SERVICE";
  public static UNABLE_TO_FIND_LOGGER: string = "UNABLE_TO_FIND_LOGGER";
  public static UNABLE_TO_START_UNNECESSARY_SERVICE: string = "UNABLE_TO_START_UNNECESSARY_SERVICE";
  public static ZM_CSFE_EXCEPTION: string = "ZM_CSFE_EXCEPTION";
  public static AJX_EXCEPTION: string = "AJX_EXCEPTION";
  public static UNABLE_TO_ENCODE_EVENT_OBJECT: string = "UNABLE_TO_ENCODE_EVENT_OBJECT";
  public static UNABLE_TO_DECODE_EVENT_OBJECT: string = "UNABLE_TO_DECODE_EVENT_OBJECT";
  public static UNABLE_TO_SEND_EVENT_OBJECT: string = "UNABLE_TO_SEND_EVENT_OBJECT";
  public static UNABLE_TO_HANDLE_EVENT_ERROR: string = "UNABLE_TO_HANDLE_EVENT_ERROR";
  public static DETECTED_502: string = "DETECTED_502";
  public static UNABLE_TO_FIND_COMMAND_FOR_EVENT: string = "UNABLE_TO_FIND_COMMAND_FOR_EVENT";
  public static UNKNOWN_ERROR: string = "UNKNOWN_ERROR";
  public static UNABLE_TO_PARSE_JSON_STRING: string = "UNABLE_TO_PARSE_JSON_STRING";
  public static UNKNOWN_JS_EXCEPTION: string = "UNKNOWN_JS_EXCEPTION";

  public static getMessage(code: string): string { return ZxErrorCode.sMsgs[code]; }

  private static sMsgs: {[key: string]: string} = {
    AJX_EXCEPTION: "AJX_EXCEPTION",
    CHAT_CONCURRENT_PING: "Multiple concurrent pings, older ping has been killed",
    CHAT_DB_EXCEPTION: "Chat database error: {message}",
    // tslint:disable-next-line:max-line-length
    CHAT_MESSAGE_SIZE_EXCEEDED: "The message sent to {target} is {length} long and exceeds {max_size} max permitted size.",
    CHAT_SQL_EXCEPTION: "Unable to execute the SQL statement: {sqlStatement}",
    DELEGATED_OR_RESOURCES_NOT_ALLOWED_TO_CHAT: "Talk is disabled for delegated access or resource accounts",
    DETECTED_502: "DETECTED_502",
    GENERIC_ERROR: "Generic Error: {details}",
    INVALID_CHAT_ACCOUNT: "{account} is not a vaild account for the chat server",
    NO_SUCH_CHAT_SESSION: "Chat session {session_id} not found",
    UNABLE_TO_DECODE_EVENT_OBJECT: "UNABLE_TO_DECODE_EVENT_OBJECT",
    UNABLE_TO_ENCODE_EVENT_OBJECT: "UNABLE_TO_ENCODE_EVENT_OBJECT",
    UNABLE_TO_FIND_COMMAND_FOR_EVENT: "UNABLE_TO_FIND_COMMAND_FOR_EVENT",
    UNABLE_TO_FIND_LOGGER: "Unable to find logger with id {loggerId}.",
    UNABLE_TO_PARSE_JSON_STRING: "UNABLE_TO_PARSE_JSON_STRING",
    UNABLE_TO_SEND_EVENT_OBJECT: "UNABLE_TO_SEND_EVENT_OBJECT",
    UNABLE_TO_START_MANDATORY_SERVICE: "{message}",
    UNABLE_TO_START_UNNECESSARY_SERVICE: "{message}",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
    UNKNOWN_JS_EXCEPTION: "JavaScript Exception: {details}",
    ZM_CSFE_EXCEPTION: "ZM_CSFE_EXCEPTION",
  };

}

if (typeof window !== "undefined") {
  // tslint:disable-next-line:no-string-literal
  (window as IZxErrorCodeWindow)["ZxErrorCode"] = ZxErrorCode;
}

interface IZxErrorCodeWindow extends Window {
  // tslint:disable-next-line:ban-types
  ZxErrorCode: Function;
}
