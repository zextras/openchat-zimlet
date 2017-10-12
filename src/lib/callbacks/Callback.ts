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

/**
 * @deprecated, use arrow functions instead
 */
export class Callback {

  public static NOOP: Callback = new Callback(undefined, () => { return; });

  public static fromFunction(fcn: (...args: any[]) => any): Callback {
    return new Callback(
      void 0,
      fcn,
    );
  }

  public static standardize(fcn: ((...args: any[]) => any)|Callback): Callback {
    if (fcn instanceof Callback) {
      return fcn;
    } else if (typeof fcn === "function") {
      return Callback.fromFunction(fcn);
    } else if (typeof fcn === "undefined") {
      return new Callback(void 0, () => { return; });
    } else {
      throw new Error("Unable to create a Callback from '" + typeof fcn + "'");
    }
  }

  protected mArguments: any[];
  private mContext: object;
  private mFunction: (...args: any[]) => any;

  constructor(obj: object, func: (...args: any[]) => any, ...args: any[]) {
    this.mContext = obj;
    this.mFunction = func;
    this.mArguments = args;
  }

  public run(...args: any[]): any {
    return this.mFunction.apply(
      this.mContext,
      [].concat(this.mArguments).concat(args),
    );
  }

  // tslint:disable-next-line:variable-name
  public createFunction(__ctxt: object, __fcn: (...args: any[]) => any, __args: any[]): (...args: any[]) => any {
    const CallbackToFunction = (...args: any[]) => {
      return __fcn.apply(
        __ctxt,
        [].concat(__args).concat(args),
      );
    };
    return CallbackToFunction;
  }

  public setContext(ctxt: object): void {
    this.mContext = ctxt;
  }

  public setFcn(fcn: (...args: any[]) => any): void {
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

}
