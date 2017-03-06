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

import {NotificationTaskType} from "./NotificationTaskType";
import {NotificationTask} from "./NotificationTask";
import {ZmToast} from "../../zimbra/zimbraMail/share/view/ZmStatusView";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ZmToastFadeType} from "../../zimbra/zimbraMail/share/view/ZmStatusView";

export class ToastNotification implements NotificationTask {
  private static TASKID: number = 0;
  private id: string;
  private notified: boolean;
  private text: string;
  private context: ZmAppCtxt;
  private duration: number;

  constructor(text: string, duration: number = 10000) {
    this.id = "TS_" + (++ToastNotification.TASKID);
    this.notified = false;
    this.text = text;
    this.duration = duration;
  }

  public getId(): string {
    return this.id;
  }

  public start(): void {
    if (this.isNotified()) return;
    let transitions: ZmToastFadeType[] = [],
      remaining: number = this.duration;
    transitions.push(ZmToast.FADE_IN);
    for (remaining; remaining > 0; remaining -= 1200) {
      transitions.push(ZmToast.PAUSE);
    }
    transitions.push(ZmToast.FADE_OUT);

    this.context.setStatusMsg(
      {
        msg        : this.text,
        transitions: transitions
      }
    );
    this.notified = true;
  }

  public stop(): void {
  }

  public setAppContext(context: ZmAppCtxt) {
    this.context = context;
  }

  public isNotified(): boolean {
    return this.notified;
  }

  public getType(): NotificationTaskType {
    return NotificationTaskType.TOAST;
  }
}