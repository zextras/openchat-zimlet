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

import {Callback} from "./Callback";

export class CallbackManager {
  private callbacks: Callback[] = [];

  constructor(...callbacks: Callback[]) {
    this.callbacks = callbacks;
  }

  /**
   * Add a callback to the callback manager.
   * @param cbk
   */
  public addCallback(cbk: Callback): void {
    const callback: Callback = Callback.standardize(cbk);
    this.callbacks.push(callback);
  }

  /**
   * Execute the callback contained into the callback manager.
   * @param args
   */
  public run(...args: any[]): any[] {
    let i: number;
    let cbk: Callback;
    const responses: any[] = [];

    for (i = 0; i < this.callbacks.length; i++) {
      cbk = this.callbacks[i];
      try {
        responses.push(
          cbk.run.apply(cbk, args),
        );
      } catch (error) {
        // TODO: Add a logger
      }
    }
    return responses;
  }

  /**
   * Exports the callback manager as closure, useful if you have a dom function which
   * accept a function as callback.
   * WARNING: DO NOT USE THIS FUNCTION IN PROJECT CODE!
   * @return {Function}
   */
  public asFunction(): (...args: any[]) => any {
    // tslint:disable-next-line:variable-name
    return ((_this: CallbackManager) => {
      return (...args: any[]) => {
        _this.run.apply(_this, args);
      };
    })(this);
  }
}
