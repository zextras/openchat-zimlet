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

export declare let printStackTrace: (options?: {
  e?: Error;
  guess?: boolean;
  mode?: "phantomjs"|"chrome"|"safari"|"ie"|"firefox"|"opera9"|"opera10a"|"opera10b"|"opera11"|"chrome"|"other"
}) => TraceLine[];

export interface TraceLine {
  className?: string;
  fileName?: string;
  lineNumber?: number;
  methodName?: string;
  nativeMethod?: boolean;
  character?: string;
}
