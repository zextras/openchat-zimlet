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

import {Bowser} from "../../libext/bowser";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {TimedCallbackFactory} from "../callbacks/TimedCallbackFactory";
import {DateProvider} from "../DateProvider";
import {IDateProvider} from "../IDateProvider";
import {URLParser} from "../URLParser";
import {Logger} from "./Logger";
import {LogLevel} from "./LogLevel";
import {ConsoleWriter} from "./writers/ConsoleWriter";
import {ILoggerWriter} from "./writers/LoggerWriter";

export class LogEngineImp {

  public static DEFAULT_LOGGER_NAME: string = "Default";
  public static ALL: string = "all";

  public CHAT: string = "chat";

  private mLoggers: {[name: string]: Logger} = {};
  private mDateProvider: IDateProvider;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mIsDev: boolean;
  private mLoggerWriter: ILoggerWriter;

  constructor(
    loggerWriter: ILoggerWriter,
    dateProvider: IDateProvider,
    timedCallbackFactory: TimedCallbackFactory,
    devMode: boolean,
  ) {
    this.mLoggerWriter = loggerWriter;
    this.mDateProvider = dateProvider;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mIsDev = devMode;
  }

  public getLogger(name: string = LogEngineImp.DEFAULT_LOGGER_NAME): Logger {
    if (!this.mLoggers.hasOwnProperty(name)) {
      const logger = new Logger(
        this.mLoggerWriter,
        this.mDateProvider,
        this.mTimedCallbackFactory,
        name,
      );
      if (this.mIsDev) { logger.setLevel(LogLevel.debug); }
      this.mLoggers[name] = logger;
    }
    return this.mLoggers[name];
  }

  public getLoggerNames(): string[] {
    const names: string[] = [];
    for (const name in this.mLoggers) {
      if (!this.mLoggers.hasOwnProperty(name)) { continue; }
      names.push(name);
    }
    return names;
  }

  public exportLog(loggerName: string = LogEngineImp.ALL): string {
    if (loggerName === LogEngineImp.ALL) {
      const tmpLog: string[] = [];
      for (const name in this.mLoggers) {
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
    ev: DwtSelectionEvent,
    loggerName: string = LogEngineImp.ALL,
    fileName: string = ["ZeXtras_log_", loggerName, "_", this.mDateProvider.getCurrentTimeMillis(), ".log"].join(""),
  ): void {
    this.getLogger(LogEngineImp.DEFAULT_LOGGER_NAME).info(
      "Preparing your log file...",
      "LogEngine",
    );

    const data = "data:text/plain," + encodeURIComponent(this.exportLog(loggerName));
    const a = document.createElement("a");

    document.body.appendChild(a);
    a.href = data;
    a.target = "_blank";
    a.download = fileName;
    try {
      const event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click", true,
        false, window,
        0, 0,
        0, 0,
        0, false,
        false, false,
        false, 0,
        null,
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
      "LogEngine",
    );
  }

}

const location: Location = (typeof window !== "undefined" && typeof window.location !== "undefined") ?
  window.location :
  {
    ancestorOrigins: {} as any,
    assign: (url: string) =>  { return; },
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    port: "",
    protocol: "",
    reload: (forcedReload?: boolean) => { return; },
    replace: (url: string) => { return; },
    search: "",
  };

const urlParser = new URLParser(location);

export let LogEngine = new LogEngineImp(
  new ConsoleWriter(),
  new DateProvider(),
  new TimedCallbackFactory(),
  urlParser.isDevMode() || urlParser.isZxDevMode(),
);
