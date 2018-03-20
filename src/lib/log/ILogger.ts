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

import {FeedbackReporter} from "./FeedbackReporter";
import {LogLevel} from "./LogLevel";

export interface ILogger {

  getName(): string;

  addReporter(reporter: FeedbackReporter): void;

  removeReporter(name: string): void;

  setLevel(level: LogLevel): void;

  getLevel(level: LogLevel): LogLevel;

  exportLog(): string;

  getLog(): string[];

  debug(obj: any, title: string): void;

  error(obj: any, title: string): void;

  err(obj: any, title: string): void;

  info(obj: any, title: string): void;

  log(obj: any, title: string): void;

  warn(obj: any, title: string): void;

}
