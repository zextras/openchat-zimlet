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
import {ZmSoundAlert} from "../../zimbra/zimbraMail/share/view/ZmSoundAlert";
import {INotificationTask} from "./NotificationTask";
import {NotificationTaskType} from "./NotificationTaskType";

export class SoundNotification implements INotificationTask {

  private static TASKID: number = 0;
  private id: string;
  private notified: boolean;

  constructor() {
    this.id = "S_" + (++SoundNotification.TASKID);
    this.notified = false;
  }

  public getId(): string {
    return this.id;
  }

  public start(): void {
    if (this.isNotified()) { return; }
    if (typeof ZmSoundAlert === "undefined") { return; }
    if (typeof document === "undefined") { return; }
    if (document.hasFocus()) { return; }
    ZmSoundAlert.getInstance().start();
    this.notified = true;
  }

  public stop(): void {
    return;
  }

  public setAppContext(context: ZmAppCtxt) {
    return;
  }

  public isNotified(): boolean {
    return this.notified;
  }

  public getType(): NotificationTaskType {
    return NotificationTaskType.SOUND;
  }
}
