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

import {json_prune} from "../../libext/json-prune";
import {JSON3 as JSON} from "../../libext/json3";
import {LogLevel} from "./LogLevel";

export class LogLine {

  private mLoggerName: string;
  private mLevel: LogLevel;
  private mTime: Date;
  private mObject: any;
  private mTitle: string;

  public constructor(
    time: Date,
    loggerName: string,
    obj: any,
    title: string = "",
    level: LogLevel = LogLevel.log,
  ) {
    this.mTime = time;
    this.mLoggerName = loggerName;
    this.mObject = obj;
    this.mTitle = title;
    this.mLevel = level;
  }

  /**
   * Get the priority of the log line.
   * @return {string}
   */
  public getLevel(): LogLevel {
    return this.mLevel;
  }

  public getLoggerName(): string {
    return this.mLoggerName;
  }

  public getDate(): Date {
    return this.mTime;
  }

  public getTitle(removeDate: boolean = false): string {
    const tmp: string[] = [];
    const nameLine = ["[", this.mLoggerName, "]"].join("");
    const priorityLine = LogLevel[this.mLevel].toUpperCase();
    const dateLine = [this.mTime.getDate(), (this.mTime.getMonth() + 1), this.mTime.getFullYear()].join("-");
    const timeLine = [
      [this.mTime.getHours(), this.mTime.getMinutes(), this.mTime.getSeconds()].join(":"),
      this.mTime.getMilliseconds(),
    ].join(",");
    const titleLine = (this.mTitle === "") ? "" : ["[", this.mTitle, "]"].join("");

    tmp.push(nameLine);
    if (!removeDate) { tmp.push(dateLine); }
    if (!removeDate) { tmp.push(timeLine); }
    tmp.push(priorityLine);
    tmp.push(titleLine);

    return tmp.join(" ");
  }

  public getObject(): any {
    return this.mObject;
  }

  public getPrettyObject(): string {
    return JSON.stringify(JSON.parse(json_prune(this.mObject)), null, 2);
  }

  public toString(prettyPrint: boolean = false): string {
    let text: string;

    if (typeof this.mObject === "string" || typeof this.mObject === "number") {
      text = this.mObject as string;
    } else {
      try {
        if (prettyPrint) {
          text = JSON.stringify(JSON.parse(json_prune(this.mObject)), null, 2);
        } else {
          text = json_prune(this.mObject);
        }
      } catch (err) {
        text = "[Unable to print object]";
      }
    }

    return this.getTitle() + " - " + text;
  }

}
