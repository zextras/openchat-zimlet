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

import {AjxDebug, DBG} from "../../../zimbra/ajax/debug/AjxDebug";
import {LogLevel} from "../LogLevel";
import {LogLine} from "../LogLine";
import {ILoggerWriter} from "./LoggerWriter";

// tslint:disable:no-console

export class ConsoleWriter implements ILoggerWriter {

  private static writeOnConsole(line: LogLine) {
    const hasGroup: boolean = (typeof console.group === "function" && typeof console.groupEnd === "function");

    if (hasGroup) {
      console.group(line.getTitle());
      if (typeof console.error === "function"
        && typeof console.warn === "function"
        && typeof console.info === "function") {

        switch (line.getLevel()) {
          case LogLevel.error:
            console.error(line.getObject());
            break;
          case LogLevel.warn:
            console.warn(line.getObject());
            break;
          case LogLevel.info:
            console.info(line.getObject());
            break;
          default:
            console.log(line.getObject());
        }
        if (typeof console.trace === "function") {
          // console.trace();
        }
        console.groupEnd();
      } else {
        console.log(line.getObject());
      }

    } else {

      console.log("/*----- BEGIN: " + line.getTitle() + " -----*/");
      console.log(line.getPrettyObject());
      console.log("/*----- END: " + line.getTitle() + " -----*/");

    }
  }

  private static writeOnZimbraDebug(line: LogLine) {
    if (typeof DBG !== "undefined") {
      let level: string;
      switch (line.getLevel()) {
        case LogLevel.error:
          level = AjxDebug.EXCEPTION || "exception";
          break;
        case LogLevel.warn:
          level = AjxDebug.EXCEPTION || "exception";
          break;
        case LogLevel.info:
          level = AjxDebug.ZIMLET || "zimlet";
          break;
        default:
          level = AjxDebug.DEFAULT_TYPE || "debug";
      }
      DBG.println(level, "<b>" + line.getTitle() + "</b>");
      try {
        DBG.dumpObj(level, line.getObject());
      } catch (ignored) {
        DBG.println(level, "<b>Unable to dump Object</b>");
      }
    }
  }

  public write(line: LogLine): void {
    if (typeof console !== "undefined") {
      ConsoleWriter.writeOnConsole(line);
    }
    // Fallback, write always on Zimbra Logger
    ConsoleWriter.writeOnZimbraDebug(line);
  }

}
