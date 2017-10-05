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

  public static getParameter(key: string): string {
    const location: Location = (typeof window !== "undefined" && typeof window.location !== "undefined") ?
      window.location :
      {
        assign: (url: string) => { return; },
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        port: "",
        protocol: "",
        reload: (forcedReload?: boolean) => { return; },
        replace: (url: string) => { return; },
        search: "",
        toString: () => "",
      } as Location;
    return (new URLParser(location)).getParameter(key);
  }

  private mParameters: {[key: string]: string};

  constructor(location: Location) {
    this.mParameters = {};
    let parameterString: string = "";
    let parameterArr: string[] = [];
    if (typeof location !== "undefined" && typeof location.search !== "undefined" && location.search !== "") {
      if (/^\?/.test(location.search)) {
        parameterString = location.search.substr(1);
      } else {
        parameterString = location.search;
      }
      parameterArr = parameterString.split("&");
    }
    for (const param of parameterArr) {
      const tmpArr = param.split("=");
      this.mParameters[tmpArr[0]] = tmpArr[1];
    }
  }

  public getKeys(): string[] {
    const tmp: string[] = [];
    for (const paramName in this.mParameters) {
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
    for (const paramName in this.mParameters) {
      if (!this.mParameters.hasOwnProperty(paramName)) { continue; }
      if (paramName.toUpperCase() === "ZXDEV") { return true; }
    }
    return false;
  }

}
