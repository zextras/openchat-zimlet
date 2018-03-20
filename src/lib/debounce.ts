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

export const debounce = (fn: (...args: any[]) => void, wait: number = 50) => {
  const debounced = new Debouncer(fn, wait);
  return (...args: any[]) => debounced.exec(...args);
};

class Debouncer {
  private mFn: (...args: any[]) => void;
  private mWait: number;
  private mTimer: number = null;

  constructor(fn: (...args: any[]) => void, wait: number) {
    this.mFn = fn;
    this.mWait = wait;
  }

  public exec(...args: any[]): void {
    if (this.mTimer !== null) {
      clearTimeout(this.mTimer as number);
    }
    this.mTimer = window.setTimeout(this.mFn, this.mWait, args);
  }

}
