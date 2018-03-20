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
import {IGroupData} from "./SettingsManager";

export interface ISettingsManager {

  get(key: string): any;
  set(key: string, value: any, callback?: Callback): void;
  onSettingChange(settingKey: string, callback: Callback): void;
  enabledEmojiInChatConversation(): boolean;
  enabledEmojiInChatHistory(): boolean;
  enabledEmojiInMail(): boolean;
  enabledUrlInChatConversation(): boolean;
  enabledUrlInChatHistory(): boolean;
  enabledUrlInMail(): boolean;
  isZimletTesting(): boolean;
  getZimletVersion(): Version;
  getZimletCommitId(): string;
  storeGroupsData(mainWindow: MainWindow): void;
  resetGroupsData(): void;
  loadGroupsData(): IGroupData[];

}
