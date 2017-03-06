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

export class URLParser {

  private mParameters: {[key: string]: string};

  constructor(location: Location) {
    this.mParameters = {};
    let parameterString: string = "",
      parameterArr: string[] = [];
    if (typeof location !== "undefined" && typeof location.search !== "undefined" && location.search !== "") {
      if (/^\?/.test(location.search)) {
        parameterString = location.search.substr(1);
      } else {
        parameterString = location.search;
      }
      parameterArr = parameterString.split("&");
    }
    for (let i: number = 0; i < parameterArr.length; i++) {
      let tmpArr = parameterArr[i].split("=");
      this.mParameters[tmpArr[0]] = tmpArr[1];
    }
  }

  public getKeys(): string[] {
    let tmp: string[] = [];
    for (let paramName in this.mParameters) {
      if (!this.mParameters.hasOwnProperty(paramName)) { continue; }
      tmp.push(paramName);
    }
    return tmp;
  }

  public getParameter(key: string): string {
    return this.mParameters[key];
  }

  public isDevMode(): boolean {
    return this.mParameters.hasOwnProperty("dev");
  }

  public isZxDevMode(): boolean {
    for (let paramName in this.mParameters) {
      if (!this.mParameters.hasOwnProperty(paramName)) { continue; }
      if (paramName.toUpperCase() === "ZXDEV") { return true; }
    }
    return false;
  }

  public static getParameter(key: string): string {
    let location: Location = (typeof window !== "undefined" && typeof window.location !== "undefined") ?
      window.location :
      {
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        port: "",
        protocol: "",
        search: "",
        assign: function(url: string): void {},
        reload: function(forcedReload?: boolean): void {},
        replace: function(url: string): void {},
        toString: function(): string { return ""; }
      };
    return (new URLParser(location)).getParameter(key);
  }

}
