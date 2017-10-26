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

import {Message} from "../dwt/widgets/Message";
import {ZmMailMsg} from "../zimbra/zimbraMail/mail/model/ZmMailMsg";
import {ZmObjectHandler} from "../zimbra/zimbraMail/share/model/ZmObjectHandler";
import {ZmObjectManager} from "../zimbra/zimbraMail/share/model/ZmObjectManager";
import {ObjectHandler} from "./ObjectHandler";

export class ObjectHandlerProxy extends ZmObjectHandler {

  private mObjectHdlr: ObjectHandler;

  constructor() {
    super("none");
    this.mObjectHdlr = ObjectHandler.getInstance();
  }

  public onFindMsgObjects(msg: ZmMailMsg|Message, manager: ZmObjectManager): void {
    return this.mObjectHdlr.onFindMsgObjects(msg, manager);
  }

}
