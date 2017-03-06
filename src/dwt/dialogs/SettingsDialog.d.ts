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

import {ZmDialog} from "../../zimbra/zimbraMail/share/view/dialog/ZmDialog";
import {DwtButton} from "../../zimbra/ajax/dwt/widgets/DwtButton";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {ChatClient} from "../../client/ChatClient";
import {SessionInfoProvider} from "../../client/SessionInfoProvider";
import {SettingsManager} from "../../settings/SettingsManager";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "../../lib/DateProvider";

export declare class SettingsDialog extends ZmDialog {

  public resetButton: DwtButton;

  public _okBtnListener(): void;

  public static getDialog(appCtxt: ZmAppCtxt,
                          shell: DwtShell,
                          mChatClient: ChatClient,
                          mSessionInfoProvider: SessionInfoProvider,
                          mSettingsManager: SettingsManager,
                          mTimedCallbackFactory: TimedCallbackFactory,
                          mDateProvider: DateProvider
  ): SettingsDialog;
}
