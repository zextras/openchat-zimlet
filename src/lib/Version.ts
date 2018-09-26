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

import {ZaServerVersionInfo} from "../zimbra/zimbraAdmin/common/ZaServerVersionInfo";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {ZmSetting} from "../zimbra/zimbraMail/share/model/ZmSetting";
import {ArrayUtils} from "./ArrayUtils";

export class Version {

  public static getZimbraVersion(): Version {
    let versionString: string = "";
    const versionRegex: RegExp = /^\d+\.\d+\.\d+/;
    try {
      if (typeof ZaServerVersionInfo !== "undefined") {
        // Admin interface
        versionString = ZaServerVersionInfo.version;
      } else if (typeof appCtxt !== "undefined") {
        // User Interface
        versionString = appCtxt.get(ZmSetting.CLIENT_VERSION);
      }
    } catch (error) {
      versionString = "";
    }
    if (versionRegex.test(versionString)) {
      return new Version(versionString.match(versionRegex)[0]);
    }
    throw new Error("Unalbe to determine the Zimbra Version");
  }

  public static compareVersions(a: string|Version, b: string|Version): number {
    let verA: Version;
    let verB: Version;
    if (typeof a === "string") {
      verA = new Version(a);
    } else {
      if (a instanceof Version) {
        verA = a;
      } else {
        throw new Error("Invalid parameter 'a'");
      }
    }
    if (typeof b === "string") {
      verB = new Version(b);
    } else {
      if (b instanceof Version) {
        verB = b;
      } else {
        throw new Error("Invalid parameter 'b'");
      }
    }
    return verA.compareTo(verB);
  }

  public static isZ8_5Up(): boolean {
    const zimbraVersion: Version = Version.getZimbraVersion().truncate(2);
    const eightFive = new Version(8, 5);
    return zimbraVersion.equals(eightFive) || zimbraVersion.moreThan(eightFive);
  }

  public static isZ8Up(): boolean {
    const zimbraVersion: Version = Version.getZimbraVersion().truncate(1);
    const eight = new Version(8);
    return zimbraVersion.equals(eight) || zimbraVersion.moreThan(eight);
  }

  /**
   * Return if the current Zimbra version is >= 7
   */
  public static isZ7Up(): boolean {
    const zimbraVersion: Version = Version.getZimbraVersion().truncate(1);
    const seven = new Version(7);
    return zimbraVersion.equals(seven) || zimbraVersion.moreThan(seven);
  }

  /**
   * Return if the current Zimbra version is === 6
   */
  public static isZ6(): boolean {
    return Version.getZimbraVersion().truncate(1).equals(new Version(6));
  }

  public static isZ8_6Up() {
    const zimbraVersion: Version = Version.getZimbraVersion().truncate(2);
    const eightSix = new Version(8, 6);
    return zimbraVersion.equals(eightSix) || zimbraVersion.moreThan(eightSix);
  }

  private mParts: number[];
  private mVersionString: string;
  private mCommit: string;

  constructor(parts: string);
  constructor(...parts: string[]);
  constructor(...parts: number[]);
  constructor(...parts: string[][]);
  constructor(...parts: number[][]);
  constructor(...parts: any[]) {
    if (parts.length === 0) {
      throw new Error("Invalid parameter");
    } else if (parts.length === 1 && typeof parts[0] === "string") {
      this.mVersionString = parts[0];
      this.mParts = [];
      const splitted: string[] = parts[0].split(".");
      for (const part of splitted) {
        this.mParts.push(parseInt(part, 10));
      }
    } else if (parts.length === 1 && ArrayUtils.isArray(parts[0])) {
      this.mParts = parts[0] as number[];
      this.mVersionString = this.mParts.join(".");
    } else {
      this.mParts = parts as number[];
      this.mVersionString = this.mParts.join(".");
    }
    this.mCommit = "";
  }

  /**
   * Set the commit
   */
  public setCommit(commit: string): void {
    this.mCommit = commit;
  }

  /**
   * Get the commit
   * @return {string}
   */
  public getCommit(): string {
    return this.mCommit;
  }

  /**
   * Compare this version with against version class.
   * -  -1
   * -   0
   * -   1
   */
  public compareTo(version: Version): number {
    const minSize: number = Math.max(this.mParts.length, version.mParts.length);
    let i: number;
    let thisPart: number;
    let otherPart: number;
    for (i = 0; i < minSize; i++) {
      thisPart = this.getPartValue(i);
      otherPart = version.getPartValue(i);
      if (otherPart > thisPart) { return -1; }
      if (otherPart < thisPart) { return 1; }
    }
    return 0;
  }

  public getPartValue(partIndex: number): number {
    if (partIndex < this.mParts.length) {
      return this.mParts[partIndex];
    } else {
      return 0;
    }
  }

  /**
   * Get the count of the parts which composes the version number.
   */
  public getPartCount(): number {
    return this.mParts.length;
  }

  public toString(): string {
    return this.mVersionString;
  }

  public truncate(maxParts: number): Version {
    const howManyParts: number = Math.min(maxParts, this.mParts.length);
    const versionParts: number[] = [];
    let i: number;
    for (i = 0; i < howManyParts; i++) {
      versionParts.push(this.mParts[i]);
    }
    return new Version(versionParts);
  }

  public getMajor(): number {
    return this.getPartValue(0);
  }

  public getMinor(): number {
    return this.getPartValue(1);
  }

  public getMicro(): number {
    return this.getPartValue(2);
  }

  public equals(parts: Version): boolean;
  public equals(...parts: any[]): boolean {
    let reqVersion: Version;
    if (parts.length === 1 && parts[0] instanceof Version) {
      reqVersion = parts[0];
    } else {
      reqVersion = new Version(parts);
    }
    return this.compareTo(reqVersion) === 0;
  }

  public lessThan(parts: Version): boolean;
  public lessThan(...parts: any[]): boolean {
    let reqVersion: Version;
    if (parts.length === 1 && parts[0] instanceof Version) {
      reqVersion = parts[0];
    } else {
      reqVersion = new Version(parts);
    }
    return this.compareTo(reqVersion) < 0;
  }

  public moreThan(parts: Version): boolean;
  public moreThan(...parts: any[]): boolean {
    let reqVersion: Version;
    if (parts.length === 1 && parts[0] instanceof Version) {
      reqVersion = parts[0];
    } else {
      reqVersion = new Version(parts);
    }
    return this.compareTo(reqVersion) > 0;
  }

}
