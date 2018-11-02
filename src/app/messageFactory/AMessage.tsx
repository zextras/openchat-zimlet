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

// tslint:disable:max-line-length

import {Component, h} from "preact";

import "./AMessage.scss";

import {IOpenChatBuddyListMap} from "../../redux/IOpenChatState";
import {MessageStatusType} from "./MessageStatusType";

export interface IAMessageProps {
  username: string;
  date: Date;
  status: MessageStatusType;
  readBy?: IOpenChatBuddyListMap;
}

export interface IAMessageState {}

export abstract class AMessage<P extends IAMessageProps, S extends IAMessageState> extends Component<P, S> {

  public abstract render(props: IAMessageProps, state: IAMessageState): any;

  protected getDateEl() {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const weekAgo: Date = new Date(midnight.getTime() - (5 * 24 * 3600 * 1000));
    const yearAgo: Date = new Date(midnight.getTime() - (365 * 24 * 3600 * 1000));
    let dateStr: string;
    try {
      if (this.props.date.getTime() >= midnight.getTime()) {
        // The message was sent today
        dateStr = this.props.date.toLocaleString(navigator.language, {
          hour: "numeric",
          minute: "numeric",
        });
      } else {
        if (this.props.date.getTime() >= weekAgo.getTime()) {
          // The message was inside the week
          dateStr = this.props.date.toLocaleString(navigator.language, {
            hour: "numeric",
            minute: "numeric",
            weekday: "short",
          });
        } else {
          // The message was inside before this week
          if (this.props.date.getTime() >= yearAgo.getTime()) {
            // The message was inside before this year
            dateStr = this.props.date.toLocaleString(navigator.language, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "long",
            });
          } else {
            dateStr = this.props.date.toLocaleString(navigator.language, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "long",
              year: "numeric",
            });
          }
        }
      }
    } catch (err) {
      dateStr = `${this.props.date.toLocaleDateString()} - ${this.props.date.toLocaleTimeString()}`;
    }
    return (
      <div className="AMessage-info-date" title={this.props.date.toLocaleString()}>
        {dateStr}
      </div>
    );
  }

  protected getStatusIconEl(): JSX.Element {
    let icon: JSX.Element = null;
    switch (this.props.status) {
      case MessageStatusType.SENDING: {
        icon = (
          <i key="1" className="fas fal fa-circle-notch fa-spin" title="Sending..."/>
        );
        break;
      }
      case MessageStatusType.SENT: {
        icon = (
          <i key="5" className="fa-stack fa-2" title="Message sent">
            <i className="fas fa-check fa-stack-1x AMessage-status-icon-first-check"/>
          </i>
        );
        break;
      }
      case MessageStatusType.READ_BY_SOMEONE: {
        icon = (
          <i key="6" className="fa-stack fa-2" title="Message was read by someone">
            <i
              className="fas fa-check fa-stack-1x AMessage-status-icon-first-check AMessage-status-icon-read-color"/>
          </i>
        );
        break;
      }
      case MessageStatusType.READ_BY_ALL: {
        icon = (
          <i key="4" className="fa-stack fa-2" title="Message was read">
            <i
              className="fas fa-check fa-stack-1x AMessage-status-icon-second-check AMessage-status-icon-read-color"/>
            <i className="fas fa-check fa-stack-1x fa-inverse AMessage-status-icon-first-check-shadow"/>
            <i className="fas fa-check fa-stack-1x AMessage-status-icon-first-check AMessage-status-icon-read-color"/>
          </i>
        );
        break;
      }
      case MessageStatusType.FAILED:
      default: {
        icon = (
          <i key="3" className="fas fa-exclamation-circle fa-fw" title="Error while sending message!"/>
        );
      }
    }

    return (
      <div className="AMessage-status">
        <div className="AMessage-status-icon">
          {icon}
        </div>
      </div>
    );
  }

}
