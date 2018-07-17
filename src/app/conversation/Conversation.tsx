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
import {Store, Unsubscribe} from "redux";

import "./Conversation.scss";

import {QueryArchiveEvent} from "../../client/events/chat/QueryArchiveEvent";
import {debounce} from "../../lib/debounce";
import {IQueryArchiveAction} from "../../redux/action/IQueryArchiveAction";
import {IOpenChatMessage, IOpenChatRoomBuddyAcksMap, IOpenChatState} from "../../redux/IOpenChatState";
import {IMessageUiFactory} from "../messageFactory/IMessageUiFactory";

export interface IConversationProps {
  dataStore: Store<IOpenChatState>;
  roomJid: string;
  messageUIFactory: IMessageUiFactory<IOpenChatState>;
  emojiSize: "16" | "32";
}

export interface IConversationState {
  isAtBottom: boolean;
  messages: IOpenChatMessage[];
  prevScrollHeight: number;
  roomAcks: IOpenChatRoomBuddyAcksMap;
  scrollPosition: number;
}

export class Conversation extends React.Component<IConversationProps, IConversationState> {
  private mElement: HTMLElement = null;
  private mUnsubscribeDataStore: Unsubscribe;
  private mUnsubscribeUIStore: Unsubscribe;
  private mIgnoreScrollEvents: boolean = false;
  private mFirstRequestHistoryDone: boolean = false;

  constructor(props: IConversationProps) {
    super(props);
    this.state = {
      isAtBottom: true,
      messages: [],
      prevScrollHeight: 0,
      roomAcks: {},
      scrollPosition: 0,
    };
  }

  public render(): JSX.Element | null | false {
    const listMessages: JSX.Element[] = this.state.messages.map((message) => {
        return this.props.messageUIFactory.getMessage(
          this.props.dataStore,
          message,
          this.props.emojiSize,
        );
      },
    );

    if (this.props.roomJid !== "") {
      return (
        <div className="Conversation">
          <div
            className="Conversation-messages"
            ref={(element: HTMLElement) => { this.mElement = element; }}
            onScroll={debounce(this.onScroll)}
          >
            {listMessages}
          </div>
        </div>
      );
    } else {
      return (<div/>);
    }
  }

  public shouldComponentUpdate(
    nextProps: Readonly<IConversationProps>,
    nextState: Readonly<IConversationState>,
    nextContext: any,
  ): boolean {
    return nextProps.roomJid !== this.props.roomJid
      || nextProps.emojiSize !== this.props.emojiSize
      || nextState.messages !== this.state.messages
      || nextState.scrollPosition !== this.state.scrollPosition
      || nextState.roomAcks !== this.state.roomAcks
      || nextState.isAtBottom !== this.state.isAtBottom
      || nextState.prevScrollHeight !== this.state.prevScrollHeight
      ;
  }

  public componentWillReceiveProps(nextProps: IConversationProps): void {
    // update messages on roomJid received
    if (this.props.roomJid !== nextProps.roomJid) {
      if (typeof this.props.dataStore.getState().rooms[nextProps.roomJid] !== "undefined") {
        this.setState({
          isAtBottom: true,
          messages: this.props.dataStore.getState().rooms[nextProps.roomJid].messages,
        });
      } else {
        this.setState({
          isAtBottom: true,
          messages: [],
        });
      }
    }
  }

  public componentDidMount(): void {
    this.nextState();
    this.mUnsubscribeDataStore = this.props.dataStore.subscribe(this.nextState);
    this.moveToBottom();
  }

  public componentWillUnmount(): void {
    if (typeof this.mUnsubscribeUIStore !== "undefined" && this.mUnsubscribeUIStore !== null) {
      this.mUnsubscribeUIStore();
    }
    if (typeof this.mUnsubscribeDataStore !== "undefined" && this.mUnsubscribeDataStore !== null) {
      this.mUnsubscribeDataStore();
    }
  }

  public componentDidUpdate(prevProps: IConversationProps, prevState: IConversationState): void {

    if ( typeof this.mElement !== "undefined" && this.mElement !== null) {
      if (
        prevState.messages !== this.state.messages
      ) {
        if (
          // check if is at bottom
          this.state.isAtBottom
        ) {
          this.moveToBottom();
        } else if (
          // check if is a new message or an history message
          !this.props.dataStore.getState().rooms[this.props.roomJid].loadingHistory
          && this.state.messages.length !== 0
        ) {
          if (
            // check if I'm the sender
            this.props.messageUIFactory.isSentByMe(
              this.props.dataStore,
              this.state.messages[this.state.messages.length - 1],
            )
          ) {
            this.moveToBottom();
          } else {
            this.scrollToPosition(this.state.prevScrollHeight, this.state.scrollPosition);
          }
        } else {
          this.scrollToPosition(this.mElement.scrollHeight, this.state.scrollPosition);
        }
      }
      if (
        // autoload messages until scrollbar is visible or history is full loaded
        this.mElement.scrollHeight < this.mElement.parentElement.offsetHeight
          || !this.mFirstRequestHistoryDone
      ) {
        this.mFirstRequestHistoryDone = true;
        this.requestHistory();
      }
    }
  }

  private moveToBottom(): void {
    if ( typeof this.mElement !== "undefined" && this.mElement !== null) {
      this.scrollToPosition(this.mElement.scrollHeight, 0);
    }
    this.setState({
      isAtBottom: true,
    });
  }

  private scrollToPosition = (scrollHeight: number, scrollPosition: number) => {
    if (typeof this.mElement !== "undefined" && this.mElement !== null) {
      this.mIgnoreScrollEvents = true;
      this.mElement.scrollTop = scrollHeight - scrollPosition;
    }
  }

  private onScroll = (ev: any) => {
    if (this.mIgnoreScrollEvents) {
      this.mIgnoreScrollEvents = false;
      return false;
    }
    this.setState({
      isAtBottom: this.mElement.scrollHeight - this.mElement.scrollTop - this.mElement.clientHeight === 0,
      prevScrollHeight: this.mElement.scrollHeight,
      scrollPosition: this.mElement.scrollHeight - this.mElement.scrollTop,
    });

    // 100 is very high
    if (
      this.mElement.clientHeight > 200 && this.mElement.scrollTop <= 100
    ) {
      this.requestHistory();
    }
  }

  // request history if it isn't loading or full loaded
  private requestHistory() {
    const roomJid = this.props.roomJid;
    const state: IOpenChatState = this.props.dataStore.getState();
    if (
      state.rooms.hasOwnProperty(roomJid)
      && !state.rooms[roomJid].loadingHistory
      && !state.rooms[roomJid].fullHistoryLoaded
    ) {
      this.props.dataStore.dispatch<IQueryArchiveAction>({
        end: (state.rooms[roomJid].messages.length > 0) ?
          state.rooms[roomJid].messages[0].date.getTime()
          :
          -1
        ,
        max: QueryArchiveEvent.DEFAULT_MAX,
        type: "QUERY_ARCHIVE",
        // tslint:disable-next-line:object-literal-key-quotes
        "with": roomJid,
      });
    }
  }

  private nextState = () => {
    const currentConversationJid = this.props.roomJid;
    let messages: IOpenChatMessage[] = this.state.messages;
    let roomAcks: IOpenChatRoomBuddyAcksMap = this.state.roomAcks;
    const state: IOpenChatState = this.props.dataStore.getState();

    if (
      state.rooms.hasOwnProperty(currentConversationJid)
    ) {
      messages = state.rooms[currentConversationJid].messages;
    } else {
      messages = [];
    }

    if (
      state.roomAcks.hasOwnProperty(currentConversationJid)
      && state.roomAcks[currentConversationJid] !== roomAcks
    ) {
      roomAcks = state.roomAcks[currentConversationJid];
    } else {
      roomAcks = {};
    }

    if (
      messages !== this.state.messages
      || roomAcks !== this.state.roomAcks
    ) {
      this.setState({
        messages: messages,
        roomAcks: roomAcks,
      });
    }
  }

  private getNicknameFromSender(sender: string): string {
    let senderAddress: string;
    let senderSource: string;
    if (sender.indexOf("/") !== -1) {
      senderAddress = sender.substring(0, sender.indexOf("/"));
      senderSource = sender.substring(sender.indexOf("/") + 1);
    } else {
      senderAddress = sender;
    }
    if (typeof senderSource !== "undefined") {
      return senderSource;
    }
    if (this.props.dataStore.getState().buddyList.hasOwnProperty(senderAddress)) {
      return this.props.dataStore.getState().buddyList[senderAddress].nickname;
    } else {
      return sender;
    }
  }

}
  /* TODO: make the scroll container adherent to bottom
  * make it works:
  * - start app and select buddy that have many message,
  * - write to inputTextArea till it grows
  * // here the scroll doesn't follow resize
  * - start app and select buddy that have many message,
  * - resize window horizontally (for example half of original size)
  * - scroll to bottom the conversation
  * - resize window to original size
  * - write to inputTextArea till it grows
  * // here the scroll follows resize
  */
