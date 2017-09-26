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

export class Map {
  private map: {[key: string]: any};

  constructor() {
    this.map = {};
  }

  public size(): number {
    let i: string;
    let count: number = 0;
    for (i in this.map) {
      if (!this.map.hasOwnProperty(i)) { continue; }
      count++;
    }
    return count;
  }

  public isEmpty(): boolean {
    let i: string;
    for (i in this.map) {
      if (!this.map.hasOwnProperty(i)) { continue; }
      return false;
    }
    return true;
  }

  public containsKey(key: string): boolean {
    return this.map.hasOwnProperty(key);
  }

  // containsValue not implemented

  public get(key: string): any {
    return this.map[key];
  }

  public put(key: string, value: any): any {
    const prevValue = this.map[key];
    this.map[key] = value;
    return prevValue;
  }

  public remove(key: string): any {
    const prevValue = this.map[key];
    delete this.map[key];
    return prevValue;
  }

  public putAll(map: Map): void {
    let i: string;
    for (i in map) {
      if (!map.hasOwnProperty(i)) { continue; }
      this.map[i] = map.map[i];
    }
  }

  public clear(): void {
    let i: string;
    for (i in this.map) {
      if (!this.map.hasOwnProperty(i)) { continue; }
      delete this.map[i];
    }
  }

  public keySet(): string[] {
    return this.getKeys();
  }

  public values(): any[] {
    let i: string;
    const values: any[] = [];
    for (i in this.map) {
      if (!this.map.hasOwnProperty(i)) { continue; }
      values.push(this.map[i]);
    }
    return values;
  }

  public entrySet(): any[] {
    let i: string;
    const entrySet: any[] = [];
    for (i in this.map) {
      if (!this.map.hasOwnProperty(i)) { continue; }
      entrySet.push([i, this.map[i]]);
    }
    return entrySet;
  }

  private getKeys(): string[] {
    if (typeof Object.keys !== "undefined") {
      return Object.keys(this);
    } else {
      // tslint:disable-next-line:no-unused-expression
      "use strict";
      const hasOwnProperty: (v: string) => boolean = Object.prototype.hasOwnProperty;
      const hasDontEnumBug: boolean = !({toString: null}).propertyIsEnumerable("toString");
      const dontEnums: string[] = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor",
      ];
      const dontEnumsLength: number = dontEnums.length;
      const result: string[] = [];
      let prop: string;
      let i: number;

      for (prop in this) {
        if (hasOwnProperty.call(this, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(this, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    }
  }
}
