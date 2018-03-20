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

import {MainWindow} from "../dwt/windows/MainWindow";
import {Callback} from "../lib/callbacks/Callback";
import {Version} from "../lib/Version";
import {ISettingsManager} from "./ISettingsManager";
import {IGroupData} from "./SettingsManager";

export class DummySettingsManager implements ISettingsManager {
  public get(key: string): any {
    return undefined;
  }

  public set(key: string, value: any, callback?: Callback): void {
  }

  public onSettingChange(settingKey: string, callback: Callback): void {
  }

  public enabledEmojiInChatConversation(): boolean {
    return undefined;
  }

  public enabledEmojiInChatHistory(): boolean {
    return undefined;
  }

  public enabledEmojiInMail(): boolean {
    return undefined;
  }

  public enabledUrlInChatConversation(): boolean {
    return undefined;
  }

  public enabledUrlInChatHistory(): boolean {
    return undefined;
  }

  public enabledUrlInMail(): boolean {
    return undefined;
  }

  public isZimletTesting(): boolean {
    return undefined;
  }

  public getZimletVersion(): Version {
    return undefined;
  }

  public getZimletCommitId(): string {
    return undefined;
  }

  public storeGroupsData(mainWindow: MainWindow): void {
  }

  public resetGroupsData(): void {
  }

  public loadGroupsData(): IGroupData[] {
    return undefined;
  }

}
