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

import {ZmObjectHandler} from "../zimbra/zimbraMail/share/model/ZmObjectHandler";
import {ZmMailMsg} from "../zimbra/zimbraMail/mail/model/ZmMailMsg";
import {Message} from "../client/Message";
import {ZmObjectManager} from "../zimbra/zimbraMail/share/model/ZmObjectManager";

export declare class ObjectHandler extends ZmObjectHandler {

  public setEmojiEnabledInConv(enabled: boolean): void;
  public setEmojiEnabledInHist(enabled: boolean): void;
  public setEmojiEnabledInMail(enabled: boolean): void;

  public onFindMsgObjects(message: ZmMailMsg|Message, manager: ZmObjectManager): void;

}
