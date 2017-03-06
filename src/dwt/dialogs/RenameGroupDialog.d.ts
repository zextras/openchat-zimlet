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
import {ChatClient} from "../../client/ChatClient";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {Group} from "../../client/Group";

export declare class RenameGroupDialog extends ZmDialog {

  public _groupNameEl: HTMLInputElement;

  constructor(params: {}, client: ChatClient, appCtxt: ZmAppCtxt, group: Group);

  public _okBtnListener(): void;

}
