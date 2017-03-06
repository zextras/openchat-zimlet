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

export class Callback {

  public static NOOP: Callback = new Callback(void 0, function() {});

  private mContext: Object;
  private mFunction: Function;
  protected mArguments: any[];

  constructor(obj: Object, func: Function, ...args: any[]) {
    this.mContext = obj;
    this.mFunction = func;
    this.mArguments = args;
  }

  public run(...args: any[]): any {
    return this.mFunction.apply(
      this.mContext,
      [].concat(this.mArguments).concat(args)
    );
  }

  public createFunction(__ctxt: Object, __fcn: Function, __args: any[]): (...args: any[]) => any {
    let CallbackToFunction = function(...args: any[]) {
      return __fcn.apply(
        __ctxt,
        [].concat(__args).concat(args)
      );
    };
    return CallbackToFunction;
  }

  public setContext(ctxt: Object): void {
    this.mContext = ctxt;
  }

  public setFcn(fcn: Function): void {
    this.mFunction = fcn;
  }

  /**
   * Exports the callback as closure.
   * WARNING: USE THIS FUNCTION THE LEAST POSSIBLE!
   * Found usages in external methods override, setTimeout and AjxListener
   * @return {Function}
   */

  public toClosure(): (...args: any[]) => any {
    return this.createFunction(this.mContext, this.mFunction, this.mArguments);
  }

  public static fromFunction(fcn: Function): Callback {
    return new Callback(
      void 0,
      fcn
    );
  }

  public static standardize(fcn: Function): Callback;
  public static standardize(fcn: Callback): Callback;
  public static standardize(fcn: any): Callback {
    if (fcn instanceof Callback) {
      return fcn;
    } else if (typeof fcn === "function") {
      return Callback.fromFunction(fcn);
    } else if (typeof fcn === "undefined") {
      return new Callback(void 0, function() {});
    } else {
      throw new Error("Unable to create a Callback from '" + typeof fcn + "'");
    }
  }
}
