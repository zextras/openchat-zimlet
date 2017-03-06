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

import {Logger} from "./Logger";
import {DateProvider} from "../DateProvider";
import {TimedCallbackFactory} from "../callbacks/TimedCallbackFactory";
import {URLParser} from "../URLParser";
import {LogLevel} from "./LogLevel";
import {LoggerWriter} from "./writers/LoggerWriter";
import {ConsoleWriter} from "./writers/ConsoleWriter";
import {Bowser} from "../../libext/bowser";

export class LogEngineImp {

  public static DEFAULT_LOGGER_NAME: string = "Default";
  public static ALL: string = "all";

  public CHAT: string = "chat";

  private mLoggers: {[name: string]: Logger} = {};
  private mDateProvider: DateProvider;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mIsDev: boolean;
  private mLoggerWriter: LoggerWriter;

  constructor(
    loggerWriter: LoggerWriter,
    dateProvider: DateProvider,
    timedCallbackFactory: TimedCallbackFactory,
    devMode: boolean
  ) {
    this.mLoggerWriter = loggerWriter;
    this.mDateProvider = dateProvider;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mIsDev = devMode;
  }

  public getLogger(name: string = LogEngineImp.DEFAULT_LOGGER_NAME): Logger {
    if (!this.mLoggers.hasOwnProperty(name)) {
      let logger = new Logger(
        this.mLoggerWriter,
        this.mDateProvider,
        this.mTimedCallbackFactory,
        name
      );
      if (this.mIsDev) logger.setLevel(LogLevel.debug);
      this.mLoggers[name] = logger;
    }
    return this.mLoggers[name];
  }

  public getLoggerNames(): string[] {
    let names: string[] = [];
    for (let name in this.mLoggers) {
      if (!this.mLoggers.hasOwnProperty(name)) { continue; }
      names.push(name);
    }
    return names;
  }

  public exportLog(loggerName: string = LogEngineImp.ALL): string {
    if (loggerName === LogEngineImp.ALL) {
      let tmpLog: string[] = [];
      for (let name in this.mLoggers) {
        if (!this.mLoggers.hasOwnProperty(name)) { continue; }
        this.mLoggers[name].debug(Bowser, "Browser data");
        tmpLog.push(this.mLoggers[name].exportLog());
      }
      return tmpLog.join("\n");
    } else {
      this.getLogger(loggerName).debug(Bowser, "Browser data");
      return this.getLogger(loggerName).exportLog();
    }
  }

  public exportToFile(
    loggerName: string = LogEngineImp.ALL,
    fileName: string = ["ZeXtras_log_", loggerName, "_", this.mDateProvider.getCurrentTimeMillis(), ".log"].join("")
  ): void {
    this.getLogger(LogEngineImp.DEFAULT_LOGGER_NAME).info(
      "Preparing your log file...",
      "LogEngine"
    );

    let data = "data:text/plain," + encodeURIComponent(this.exportLog(loggerName)),
      a = document.createElement("a");

    document.body.appendChild(a);
    a.href = data;
    a.target = "_blank";
    a.download = fileName;
    try {
      let event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
      );
      a.dispatchEvent(event);
    } catch (err) {
      a.click();
    }
    if (typeof URL !== "undefined" && typeof URL.revokeObjectURL !== "undefined") {
      URL.revokeObjectURL(a.href);
    }

    this.getLogger(LogEngineImp.DEFAULT_LOGGER_NAME).info(
      "Log exported, send it to the developer team!",
      "LogEngine"
    );
  }

}

let location: Location = (typeof window !== "undefined" && typeof window.location !== "undefined") ?
  window.location :
  {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    port: "",
    protocol: "",
    search: "",
    assign: function(url: string): void {},
    reload: function(forcedReload?: boolean): void {},
    replace: function(url: string): void {},
    toString: function(): string { return ""; }
  };

let urlParser = new URLParser(location);

export let LogEngine = new LogEngineImp(
  new ConsoleWriter(),
  new DateProvider(),
  new TimedCallbackFactory(),
  urlParser.isDevMode() || urlParser.isZxDevMode()
);

