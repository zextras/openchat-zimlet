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

import {Callback} from "../callbacks/Callback";
import {NotificationTaskType} from "./NotificationTaskType";
import {NotificationTask} from "./NotificationTask";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {TimedCallbackFactory} from "../callbacks/TimedCallbackFactory";

export class DesktopNotification implements NotificationTask {
  private static TASKID: number = 0;
  private id: string;
  private notified: boolean;
  private internalNotification: Notification;
  private text: string;
  private icon: string;
  private title: string;
  private duration: number;
  private mTimedCallbackFactory: TimedCallbackFactory;

  constructor(title: string, text: string, icon: string, timedCallbackFactory: TimedCallbackFactory, duration: number = 10000) {
    this.id = "D_" + (++DesktopNotification.TASKID);
    this.notified = false;
    this.duration = duration;
    this.title = title;
    this.text = text;
    if (icon !== null) {
      // Prevent GET error
      this.icon = icon;
    }
    this.mTimedCallbackFactory = timedCallbackFactory;
  }

  public getId(): string {
    return this.id;
  }

  public start(): void {
    if (this.isNotified()) return;
    if (typeof Notification === "undefined") return;
    if (typeof document === "undefined") return;
    if (document.hasFocus()) return;

    this.internalNotification = new Notification(
      this.title,
      {
        dir : "auto",
        // lang: ""
        tag : this.getId(),
        body: this.text,
        icon: this.icon
      }
    );
    this.internalNotification.onclick = (new Callback(this, this.onClick)).toClosure();
    this.internalNotification.onshow = (new Callback(this, this.onShow)).toClosure();
    this.notified = true;
  }

  public stop(): void {
    if (typeof this.internalNotification !== "undefined") {
      this.internalNotification.close();
    }
  }

  public setAppContext(context: ZmAppCtxt) {
  }

  public isNotified(): boolean {
    return this.notified;
  }

  public getType(): NotificationTaskType {
    return NotificationTaskType.DESKTOP;
  }

  private onClick(): void {
    if (typeof window !== "undefined") window.focus();
    this.stop();
  }

  private onShow(): void {
    if (typeof setTimeout === "undefined") return;
    this.mTimedCallbackFactory.createTimedCallback(
      new Callback(this, this.stop),
      this.duration
    ).start();
  }
}