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

import {Callback} from "../callbacks/Callback";
import {TimedCallbackFactory} from "../callbacks/TimedCallbackFactory";
import {IDateProvider} from "../IDateProvider";
import {FeedbackReporter} from "./FeedbackReporter";
import {ILogger} from "./ILogger";
import {LogLevel} from "./LogLevel";
import {LogLine} from "./LogLine";
import {ILoggerWriter} from "./writers/LoggerWriter";

export class Logger implements ILogger {

  public static DEFAULT_LEVEL: LogLevel = LogLevel.info;
  public static MAX_LOG_LINES: number = 128;

  private mName: string;
  private mLog: string[];
  private mDateProvider: IDateProvider;
  private mTimedCallbackFactory: TimedCallbackFactory;

  private mLogLevel: LogLevel;
  private mReporters: {[name: string]: FeedbackReporter} = {};
  private mLoggerWriter: ILoggerWriter;

  constructor(
    loggerWriter: ILoggerWriter,
    dateProvider: IDateProvider,
    timedCallbackFactory: TimedCallbackFactory,
    name: string,
  ) {
    this.mLoggerWriter = loggerWriter;
    this.mDateProvider = dateProvider;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mName = name;
    this.mLog = [];
    this.mLogLevel = Logger.DEFAULT_LEVEL;
  }

  public getName(): string {
    return this.mName;
  }

  /**
   * Add a log reporter to the LogEngine.
   * @param {FeedbackReporter} reporter
   */
  public addReporter(reporter: FeedbackReporter): void {
    this.mReporters[reporter.getName()] = reporter;
  }

  public removeReporter(name: string): void {
    if (this.mReporters.hasOwnProperty(name)) {
      this.mReporters[name] = null;
      delete this.mReporters[name];
    }
  }

  public setLevel(level: LogLevel): void {
    this.mLogLevel = level;
  }

  public getLevel(level: LogLevel): LogLevel {
    return this.mLogLevel;
  }

  public exportLog(): string {
    return this.mLog.join("\n");
  }

  public getLog(): string[] {
    return this.mLog;
  }

  public debug(obj: any, title: string): void {
    this.logLine(new LogLine(
      this.mDateProvider.getNow(),
      this.mName,
      obj,
      title,
      LogLevel.debug,
    ));
  }

  public error(obj: any, title: string): void {
    this.err(obj, title);
  }

  public err(obj: any, title: string): void {
    this.logLine(new LogLine(
      this.mDateProvider.getNow(),
      this.mName,
      obj,
      title,
      LogLevel.error,
    ));
  }

  public info(obj: any, title: string): void {
    this.logLine(new LogLine(
      this.mDateProvider.getNow(),
      this.mName,
      obj,
      title,
      LogLevel.info,
    ));
  }

  public log(obj: any, title: string): void {
    this.logLine(new LogLine(
      this.mDateProvider.getNow(),
      this.mName,
      obj,
      title,
      LogLevel.log,
    ));
  }

  public warn(obj: any, title: string): void {
    this.logLine(new LogLine(
      this.mDateProvider.getNow(),
      this.mName,
      obj,
      title,
      LogLevel.warn,
    ));
  }

  private logLine(line: LogLine): void {

    if (line.getLevel() >= this.mLogLevel) {
      this.mLoggerWriter.write(line);
    }

    this.mTimedCallbackFactory.createTimedCallback(
      new Callback(this, this.reportAndPrune, line),
      10,
    ).start();
  }

  private reportAndPrune(line: LogLine): void {
    for (const reporterName in this.mReporters) {
      if (!this.mReporters.hasOwnProperty(reporterName)) { continue; }

      const reporter: FeedbackReporter = this.mReporters[reporterName];

      switch (line.getLevel()) {
        case LogLevel.debug:
          reporter.captureDebug(line.getPrettyObject(), line.getTitle(true));
          break;
        case LogLevel.log:
          reporter.captureLog(line.getPrettyObject(), line.getTitle(true));
          break;
        case LogLevel.info:
          reporter.captureInfo(line.getPrettyObject(), line.getTitle(true));
          break;
        case LogLevel.warn:
          reporter.captureWarning(line.getPrettyObject(), line.getTitle(true));
          break;
        case LogLevel.error:
          reporter.captureError(line.getObject(), line.getTitle(true));
          break;
        default:
          reporter.captureError(line.getPrettyObject(), line.getTitle(true));
      }

    }
    this.mLog.push(line.toString());
    if (this.mLog.length > Logger.MAX_LOG_LINES) {
      const howToRemove: number = this.mLog.length - Logger.MAX_LOG_LINES;
      this.mLog.splice(0, howToRemove);
    }
  }

}
