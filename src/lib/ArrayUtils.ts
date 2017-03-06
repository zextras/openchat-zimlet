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

export class ArrayUtils {
  /**
   * Test if the object is an array.
   * @param {any} array
   * @return {boolean}
   */
  public static isArray(array: any): boolean {
    return {}.toString.call(array) === "[object Array]";
  }

  /**
   * Filter an array, return the elements of the array which are
   * considered valid by the callback function.
   * @param {any[]} array
   * @param {function} callback
   * @return {any[]}
   */
  public static filter(array: any[], callback: Function): any[] {
    let toRet: any[] = [],
      i: number;
    for (i = 0; i < array.length; i++) {
      if (callback(array[i])) {
        toRet.push(array[i]);
      }
    }
    return toRet;
  }

  /**
   * Get the index of an object inside an array.
   * This method will try to use the ES5 Array.prototype.indexOf() function,
   * if is not available, will be used a polyfill function suggested by MDN
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
   * @param {[]} array
   * @param {{}} searchElement
   * @param {number=0} fromIndex
   * @return {number}
   */
  public static indexOf(array: any[], searchElement: any, fromIndex: number = 0): number {
    if (!![].indexOf) {
      return [].indexOf.call(array, searchElement, fromIndex);
    }
    else {
      return ArrayUtils._indexOf(array, searchElement, fromIndex);
    }
  }

  private static _indexOf(array: any[], searchElement: any, fromIndex: number = 0) {
    let k: number;

    // 1. Let O be the result of calling ToObject passing
    //    the this value as the argument.
    if (array == null) {
      throw new TypeError("'this' is null or not defined");
    }

    let O = <Array<Object>>Object(array);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    let len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    let n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of O with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  }
}
