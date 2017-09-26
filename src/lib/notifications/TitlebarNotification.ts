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

import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ZmBrowserAlert} from "../../zimbra/zimbraMail/share/view/ZmBrowserAlert";
import {NotificationTask} from "./NotificationTask";
import {NotificationTaskType} from "./NotificationTaskType";

export class TitlebarNotification implements NotificationTask {
  private static TASKID: number = 0;
  private id: string;
  private notified: boolean;
  private text: string;

  constructor(text: string) {
    this.id = "TB_" + (++TitlebarNotification.TASKID);
    this.notified = false;
    this.text = text;
  }

  public getId(): string {
    return this.id;
  }

  public start(): void {
    if (this.isNotified()) { return; }
    if (typeof ZmBrowserAlert === "undefined") { return; }
    if (typeof document === "undefined") { return; }
    if (document.hasFocus()) { return; }
    ZmBrowserAlert.getInstance().start(this.text);
    this.notified = true;
  }

  public stop(): void {
  }

  public setAppContext(context: ZmAppCtxt) {
  }

  public isNotified(): boolean {
    return this.notified;
  }

  public getType(): NotificationTaskType {
    return NotificationTaskType.TITLEBAR;
  }
}
