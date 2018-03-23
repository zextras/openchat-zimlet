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

import * as React from "react";

import "./MessageSent.scss";

import {AMessage, IAMessageProps, IAMessageState} from "./AMessage";

interface IMessageSentProps extends IAMessageProps {}

interface IMessageSentState extends IAMessageState {}

export class MessageSent extends AMessage<IMessageSentProps, IMessageSentState> {

  public render(): JSX.Element | false | null {
    return (
      <div className="MessageSent">
        <div className="MessageSent-info">
          {this.getDateEl()}
          <div className="MessageSent-info-sender">
            {this.props.username}
          </div>
        </div>
        <div className="MessageSent-content">
          <div className="MessageSent-content-triangle-right"/>
          <div className="MessageSent-content-container">
            {this.props.children}
          </div>
        </div>
        {this.getStatusIconEl()}
      </div>
    );
  }

}