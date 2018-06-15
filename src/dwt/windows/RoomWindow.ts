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

import {Store, Unsubscribe} from "redux";
import {BuddyStatusUtils} from "../../app/conversation/BuddyStatusUtils";
import {IMessageUiFactory} from "../../app/messageFactory/IMessageUiFactory";
import {BuddyStatus} from "../../client/BuddyStatus";
import {BuddyStatusType} from "../../client/BuddyStatusType";
import {WritingStatusEvent} from "../../client/events/chat/WritingStatusEvent";
import {ISessionInfoProvider} from "../../client/ISessionInfoProvider";
import {MessageReceived} from "../../client/MessageReceived";
import {MessageSent} from "../../client/MessageSent";
import {TextCompletePlugin} from "../../jquery/TextCompletePlugin";
import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {TimedCallback} from "../../lib/callbacks/TimedCallback";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {IDateProvider} from "../../lib/IDateProvider";
import {LearningClipUtils} from "../../lib/LearningClipUtils";
import {LogEngine} from "../../lib/log/LogEngine";
import {Logger} from "../../lib/log/Logger";
import {NotificationManager} from "../../lib/notifications/NotificationManager";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {StringUtils} from "../../lib/StringUtils";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {IAddMessageToRoomAction} from "../../redux/action/IAddMessageToRoomAction";
import {IRoomAction} from "../../redux/action/IRoomAction";
import {ISendRoomAckAction} from "../../redux/action/ISendRoomAckAction";
import {
  IOpenChatBuddyStatus, IOpenChatMessage, IOpenChatRoom, IOpenChatState,
  IOpenChatTextMessage,
} from "../../redux/IOpenChatState";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtDraggable} from "../../zimbra/ajax/dwt/core/DwtDraggable";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtKeyEvent} from "../../zimbra/ajax/dwt/events/DwtKeyEvent";
import {DwtUiEvent} from "../../zimbra/ajax/dwt/events/DwtUiEvent";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtInputField} from "../../zimbra/ajax/dwt/widgets/DwtInputField";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {DwtToolBar, DwtToolBarButton} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {EmojiOnePickerButton} from "../widgets/emoji/EmojiOnePickerButton";
import {IEmojiData} from "../widgets/emoji/EmojiTemplate";
import {LoadingDots} from "../widgets/LoadingDots";
import {ReactDwtConversation} from "../widgets/ReactDwtConversation";
import {RoomWindowMenuButton} from "./RoomWindowMenuButton";
import {WindowBase} from "./WindowBase";

import "./RoomWindow.scss";

export type RoomWindowType = RoomWindow<IOpenChatState>;

export class RoomWindow<S extends IOpenChatState>
  extends WindowBase {

  public static PluginName: string = "Room Window";
  public static BuddyStatusChangedPlugin: string = "Room Window Buddy Status Changed";
  public static DEFAULT_ICON: string = "ImgZxChat_personalized_brand";
  public static WIDTH: number  = ZimbraUtils.isUniversalUI() ? 315 : 228;
  public static HEIGHT: number = ZimbraUtils.isUniversalUI() ? 446 : 338;
  public static _SMOOTH_MOVE_DELAY: number = 800;

  private static recursiveFocus(context: DwtComposite): boolean {
    if (typeof context.hasFocus === "function" && context.hasFocus()) {
      return true;
    } else {
      if (typeof context.getChildren === "function") {
        for (const child of context.getChildren()) {
          const hasFocus: boolean = RoomWindow.recursiveFocus(child);
          if (hasFocus) {
            return true;
          }
        }
      }
    }
    return false;
  }

  protected mStore: Store<S>;
  protected mInputField: DwtInputField;
  protected mUnsubscribe: Unsubscribe;
  protected mMessages: IOpenChatMessage[];
  private Log: Logger;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mSessionInfoProvider: ISessionInfoProvider;
  private mRoomJid: string;
  private mPopupLocked: boolean;
  private mNotificationManager: NotificationManager;
  private mDateProvider: IDateProvider;
  private mRoomWindowPluginManager: ChatPluginManager;
  private mOnMessageReceivedCallbacks: CallbackManager;
  private mOnWindowOpenedCallbacks: CallbackManager;
  private mOnWindowClosedCallbacks: CallbackManager;
  private mOnStartDragCallbacks: CallbackManager;
  private mOnDuringDragCallbacks: CallbackManager;
  private mOnDragEndCallbacks: CallbackManager;
  private mWritingTimerCallback: TimedCallback;
  private mBuddyWritingStatuses: {[buddyId: string]: number};
  private mContainerView: DwtComposite;
  private mTitleDragBar: DwtToolBar;
  private mTitleButtonBar: DwtToolBar;
  private mTitleLbl: DwtLabel;
  private mMainMenuButton: RoomWindowMenuButton;
  private mCloseButton: DwtToolBarButton;
  private mConversation: ReactDwtConversation;
  private mWritingStatusDots: LoadingDots;
  private mLastPopup: number;
  private mEmoticonBtn: EmojiOnePickerButton;
  private mTimeoutWrittenStatus: number;
  private mRestartTimerCallbackOnTimeout: boolean = false;
  private mDefaultConversationHeight: string;
  private mTitlebar: DwtToolBar;
  private mRoomWindowStatusType: BuddyStatusType;
  private mRoomType: "chat" | string;

  constructor(
    shell: DwtShell,
    timedCallbackFactory: TimedCallbackFactory,
    roomJid: string,
    notificationManager: NotificationManager,
    dateProvider: IDateProvider,
    sessionInfoProvider: ISessionInfoProvider,
    roomWindowPluginManager: ChatPluginManager,
    popupLocked: boolean,
    store: Store<S>,
    messageUiFactory: IMessageUiFactory<IOpenChatState>,
  ) {
    super(
      shell,
      "ZxChat_RoomWindow",
      BuddyStatus.getCSS(BuddyStatusType.OFFLINE),
      "Chat",
      [],
      undefined,
      false,
    );
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mRoomJid = roomJid;
    this.mPopupLocked = popupLocked;
    this.mNotificationManager = notificationManager;
    this.mDateProvider = dateProvider;
    this.mRoomWindowPluginManager = roomWindowPluginManager;
    this.mStore = store;
    this.mRoomType = store.getState().rooms[this.mRoomJid].roomType;
    this.mRoomWindowPluginManager.switchOn(this);
    this.mOnMessageReceivedCallbacks = new CallbackManager();
    this.mOnWindowOpenedCallbacks = new CallbackManager();
    this.mOnWindowClosedCallbacks = new CallbackManager();
    this.mOnStartDragCallbacks = new CallbackManager();
    this.mOnDuringDragCallbacks = new CallbackManager();
    this.mOnDragEndCallbacks = new CallbackManager();
    this.mWritingTimerCallback = null;
    this.mBuddyWritingStatuses = {};
    this.mContainerView = new DwtComposite({parent: this});
    this.mContainerView.setHandler(
      "onmousedown",
      (ev: DwtEvent) => {
        this.mContainerView.parent.focus();
        return true;
      },
    );
    this.mTitlebar = new DwtToolBar({
      className: "ZxChat_TitleBar_Toolbar",
      parent: this.mContainerView,
      parentElement: (this._titleBarEl.children[0] as HTMLElement),
    });
    // Fix between versions
    this.mTitlebar.getHtmlElement().onmouseup = (ev: MouseEvent) => {
      const target: HTMLElement = ev.target as HTMLElement;
      if (target.className === "ImgZxChat_preferences" || target.className === "ImgZxChat_close") {
        // Run default handler
        DwtControl.__mouseUpHdlr(ev);
      }
    };
    this.mTitleDragBar = new DwtToolBar({
      className: "ZxChat_TitleBar_Toolbar_Child",
      parent: this.mTitlebar,
    });
    this.mTitleDragBar.setSize(
      `${RoomWindow.WIDTH - (ZimbraUtils.isUniversalUI() ? 80 : 68)}px`,
      Dwt.DEFAULT,
    );
    this.mTitleLbl = new DwtLabel({
      className: `WindowBaseTitleBar${!ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`,
      parent: this.mTitleDragBar,
    });
    // TODO: Dirty hack to modify the title label classname
    document.getElementById(this.mTitleLbl.getHTMLElId() + "_title").className +=
      ` RoomWindowTitleBar-TitleLabel${ZimbraUtils.isUniversalUI() ? "" : "-legacy-ui" }`;
    this._initializeDragging(this.mTitleDragBar.getHTMLElId());
    this.mTitleDragBar.addFiller();
    this.mTitleButtonBar = new DwtToolBar({parent: this.mTitlebar, className: "ZxChat_TitleBar_Toolbar_Child"});
    this.mMainMenuButton = new RoomWindowMenuButton(this, this.mTitleButtonBar, this.mRoomWindowPluginManager);
    this.mCloseButton = new DwtToolBarButton({
      className: `ZToolbarButton ZxChat_Button ZxChat_TitleBar_Button${ZimbraUtils.isUniversalUI() ? "" : "_legacy"}`,
      parent: this.mTitleButtonBar,
    });
    if (ZimbraUtils.isUniversalUI()) {
      this.mCloseButton.setImage("Close");
    } else {
      this.mCloseButton.setImage("ZxChat_close");
    }
    this.mCloseButton.addSelectionListener(new AjxListener(this, this.closeCallback));
    // this._initializeDragging(this.mTitleDragBar.getHTMLElId());
    this.mConversation = new ReactDwtConversation({
      parent: this.mContainerView,
      props: {
        dataStore: store,
        emojiSize: "16",
        messageUIFactory: messageUiFactory,
        roomJid: roomJid,
      },
    });
    this.mWritingStatusDots = new LoadingDots(this.mContainerView, { dots: 5 });
    // this.mRoom.onAddMessageReceived(new Callback(this, this.onAddMessageReceived));
    // this.mRoom.onBuddyWritingStatus(new Callback(this, this.onBuddyWritingStatus));
    // this.mRoom.onRoomStatusChange(new Callback(this, this.onRoomStatusChange));
    // this.mRoom.onAddMessageSent(new Callback(this, this.onAddMessageSent));
    // this.mRoom.onAddMessageSentFromAnotherSession(new Callback(this, this.onAddMessageSentFromAnotherSession));
    // this.mRoom.onBuddyStatusChange(new Callback(this, this.onBuddyStatusChange));
    // this.mRoom.onMemberRemoved(new Callback(this, this.onMemberRemoved));
    // this.mRoom.onTitleChange(new Callback(this, this.setTitle));
    // this.mRoom.onTriggeredPopup(() => this.popup(undefined, true));
    // this.mRoom.onTriggeredInputFocus(() => this.inputfieldFocus());
    this.mLastPopup = 0;
    const inputToolbar: DwtToolBar = new DwtToolBar({parent: this.mContainerView, className: "ZxChat_RoomToolbar"});

    this.mInputField = new DwtInputField({
      className: "DwtInputField RoomWindowConversationInput",
      forceMultiRow: true,
      hint: ZimbraUtils.isZimbraVersionLessThan85() ? undefined : StringUtils.getMessage("type_a_message"),
      parent: inputToolbar,
      rows: 1,
    });
    // this.mInputField._focusByMouseUpEvent = DwtControl.prototype._focusByMouseUpEvent;
    TextCompletePlugin.installOnTextField(this.mInputField.getInputElement());
    inputToolbar.addFiller();
    this.mEmoticonBtn = new EmojiOnePickerButton(
      { parent: inputToolbar },
      new Callback(this, this.onEmojiSelected),
      true,
    );
    this.mInputField.addListener(
      DwtEvent.ONKEYUP,
      new AjxListener(this, this.keyboardListener),
    );
    this.mInputField.addListener(
      DwtEvent.ONMOUSEMOVE,
      new AjxListener(this, this.stopBlink),
    );
    if (typeof this.mDefaultConversationHeight === "undefined" && this.mDefaultConversationHeight !== null) {
      // tslint:disable-next-line:max-line-length
      this.mDefaultConversationHeight = `${RoomWindow.HEIGHT - inputToolbar.getSize().y - this.mTitleDragBar.getSize().y - this.mWritingStatusDots.getSize().y}px`;
    }
    this.mConversation.setSize(
      `${RoomWindow.WIDTH - 8}px`,
      this.mDefaultConversationHeight,
    );
    this.mInputField.setSize(
      `${RoomWindow.WIDTH - (ZimbraUtils.isUniversalUI() ? 80 : 62)}px`, // this.emoticonBtn.getSize().x,
      Dwt.DEFAULT,
    );
    // this.setSize(
    //   `${RoomWindow.WIDTH}px`,
    //   `${RoomWindow.HEIGHT}px`
    // );
    this.setView(this.mContainerView);
    this.mTimeoutWrittenStatus = 5000;
    this.setZIndex(499);
    this.mRoomWindowPluginManager.triggerPlugins(RoomWindow.PluginName);
  }

  public init(): void {
    this.mInputField.addListener(
      DwtEvent.ONFOCUS,
      new AjxListener(this, this.onFocus),
    );
  }

  public getType(): "chat" | string {
    return this.mRoomType;
  }

  public getDateProvider(): IDateProvider {
    return this.mDateProvider;
  }

  public getPluginManager(): ChatPluginManager {
    return this.mRoomWindowPluginManager;
  }

  public getId(): string {
    return this.mRoomJid;
  }

  public getConversationContainer(): DwtComposite {
    return this.mContainerView;
  }

  // public getConversation(): Conversation {
  //   return this.mConversation;
  // }

  // public getDefaultConversationHeight(): string {
  //   return this.mDefaultConversationHeight;
  // }

  public setTitle(title: string): void {
    if (title.length > (ZimbraUtils.isUniversalUI() ? 25 : 18)) {
      this.mTitleLbl.setToolTipContent(title);
      title = LearningClipUtils.clip(title, WindowBase.MAX_TITLE_LENGTH, "DwtDialogTitle ZxChatWindowTitle");
    }
    this.mTitleLbl.setText(title);
  }

  public getTitle(): string {
    return this.mTitleLbl.getText();
  }

  public setRoomWindowStatusType(type: BuddyStatusType): void {
    this.mRoomWindowStatusType = type;
  }

  public getRoomWindowStatusType(): BuddyStatusType {
    return this.mRoomWindowStatusType;
  }

  public setIcon(icon: string): void {
    this.mTitleLbl.setImage(icon);
  }

  public _createHtmlFromTemplate(templateId: string, data: {[name: string]: any} = {}) {
    data.doNotRenderTitleBar = true;
    super._createHtmlFromTemplate(templateId, data);
  }

  public addTextToInput(newText: string): void {
    const position: number = this.getCurrentInputPosition(
      this.mInputField.getInputElement() as IExtendedHTMLInputElement,
    );
    const currentValue: string = this.mInputField.getValue();
    let pre: string = currentValue.slice(0, position);
    pre = (pre !== "") ? `${pre} ` : "";
    const post: string = currentValue.slice(position);
        // post = if post != "" then " #{post}" else ""
    const newValue: string = `${pre}${newText} ${post}`;
    this.mInputField.setValue(newValue);
    this.mInputField.focus();
    this.mInputField.moveCursorToEnd();
  }

  public inputfieldFocus(): void {
    this.mInputField.focus();
  }

  public popup(point?: DwtPoint, setExpand?: boolean): void {
    if (this.mPopupLocked) {
      return;
    }
    this.mConversation.mountComponent();
    this.mUnsubscribe = this.mStore.subscribe(() => this.checkState());
    this.checkState();
    if (
      this.getConversationContainer().parent.getHTMLElId() === this.getHTMLElId()
    ) {
      if (!this.isPoppedUp()) {
        const date: Date = this.mDateProvider.getNow();
        this.mLastPopup = date.getTime();
        super.popup(point);
        this.mOnWindowOpenedCallbacks.run(this, point);
        if (setExpand === false) {
          this.setMinimized();
        }
      }
      if (setExpand === true) {
        this.setExpanded();
      }
    }
  }

  public popdown(): void {
    this.mUnsubscribe();
    super.popdown();
    this.mOnWindowClosedCallbacks.run(this);
  }

  public onMessageReceived(callback: Callback): void {
    this.mOnMessageReceivedCallbacks.addCallback(callback);
  }

  public onWindowOpened(callback: Callback): void {
    this.mOnWindowOpenedCallbacks.addCallback(callback);
  }

  public onWindowClosed(callback: Callback): void {
    this.mOnWindowClosedCallbacks.addCallback(callback);
  }

  public onStartDrag(callback: Callback): void {
    this.mOnStartDragCallbacks.addCallback(callback);
  }

  public onDuringDrag(callback: Callback): void {
    this.mOnDuringDragCallbacks.addCallback(callback);
  }

  public onDragEnd(callback: Callback): void {
    this.mOnDragEndCallbacks.addCallback(callback);
  }

  // Override DwtBaseDialog.prototype._dragStart
  public _dragStart(point: number[]): void {
    this.focus();
    const x: number = point[0];
    const y: number = point[1];
    super._dragStart(point);
    const currentSize = this.getSize();
    DwtDraggable.setDragBoundaries(
      DwtDraggable.dragEl,
      0,
      document.body.offsetWidth - currentSize.x,
      document.body.offsetHeight - currentSize.y,
      document.body.offsetHeight - currentSize.y,
    );
    this.mOnStartDragCallbacks.run(this, x, y);
  }

  public _duringDrag(point: number[]): void {
    const x: number = point[0];
    const y: number = point[1];
    super._duringDrag(point);
    this.mOnDuringDragCallbacks.run(this, x, y);
  }

  public _dragEnd(point: number[]): void {
    const x: number = point[0];
    const y: number = point[1];
    super._dragEnd(point);
    this.mOnDragEndCallbacks.run(this, x, y);
  }

  public _dropListener(ev: Event): void {
    this.Log.debug(ev, "Something dropped on the room window");
  }

  public isFocused(): boolean {
    return RoomWindow.recursiveFocus(this);
  }

  public getOriginalZIndex(): number {
    return WindowBase.Z_INDEX;
  }

  public lockPopup(): void {
    this.mPopupLocked = true;
  }

  public unlockPopup(): void {
    this.mPopupLocked = false;
  }

  protected checkState(): void {
    if (typeof this.mStore.getState().buddyList[this.getId()] !== "undefined") {
      const buddyNickname: string = this.mStore.getState().buddyList[this.getId()].nickname;
      if (buddyNickname !== this.mTitleLbl.getText()) {
        this.setTitle(buddyNickname);
      }
      const buddyStatus: IOpenChatBuddyStatus =
        BuddyStatusUtils.getBestStatus(this.mStore.getState().buddyList[this.getId()]);
      if (this.mRoomWindowStatusType !== buddyStatus.type) {
        this.mRoomWindowStatusType = buddyStatus.type;
        this.setIcon(BuddyStatus.getCSS(this.mRoomWindowStatusType));
      }
      if (typeof this.mStore.getState().rooms[this.getId()] !== "undefined") {
        const receivedWritingStatus: "reset" | "isWriting" | "hasWritten" =
          this.mStore.getState().rooms[this.getId()].writingStatus;
        const currentBuddyWritingStatus: number = this.mBuddyWritingStatuses[this.getId()];
        if (currentBuddyWritingStatus !== WritingStatusEvent.fromStringToType(receivedWritingStatus)) {
          this.onBuddyWritingStatus(WritingStatusEvent.fromStringToType(receivedWritingStatus));
        }
        const room: IOpenChatRoom = this.mStore.getState().rooms[this.getId()];
        if (
          this.mMessages !== room.messages
          && !room.loadingHistory
        ) {
          this.mMessages = room.messages;
          if (this.isFocused()) {
            this.checkAndSendRoomAck();
          }
        }
      }
    } else {
      this.popdown();
      this.mUnsubscribe();
    }
  }

  protected keyboardListener(ev: Event): boolean {
    this.stopBlink();
    const event: DwtKeyEvent = new DwtKeyEvent();
    event.setFromDhtmlEvent(DwtUiEvent.getEvent(ev));

    let writingValue: number = WritingStatusEvent.RESET;

    if (DwtKeyEvent.getCharCode(event) === DwtKeyEvent.KEY_ENTER && !event.shiftKey) {
      const currentInputPosition: number = this.getCurrentInputPosition(
        this.mInputField.getInputElement() as IExtendedHTMLInputElement,
      );
      const realMessage: string = this.mInputField.getInputElement().value; // this.mInputField.getValue execute trim
      let message: string = realMessage;
      if (realMessage.substring(currentInputPosition, currentInputPosition + 2) === "\r\n") {
        message =
          `${realMessage.substring(0, currentInputPosition)}${realMessage.substring(currentInputPosition + 2)}`;
      } else if (realMessage.substring(currentInputPosition - 1, currentInputPosition) === "\n") {
        message =
          `${realMessage.substring(0, currentInputPosition - 1)}${realMessage.substring(currentInputPosition)}`;
      } else { return; } // It isn't a send DwtKeyEvent.KEY_ENTER
      message = StringUtils.trim(message);
      this.mInputField.clear();
      if (message.length > 0) {
        const tempMessageId: string = Math.random().toString(36).substring(2, 10);
        const roomType: "chat" | string = this.mStore.getState().rooms[this.getId()].roomType;
        this.mStore.dispatch<IAddMessageToRoomAction<IOpenChatTextMessage>>({
          jid: this.getId(),
          message: {
            content: message,
            date: this.mDateProvider.getNow(),
            destination: this.getId(),
            id: tempMessageId,
            roomType: this.mStore.getState().rooms[this.getId()].roomType,
            sender: `${roomType === "chat" ? "" : `${this.getId()}/`}${this.mStore.getState().sessionInfo.username}`,
            type: "message",
          },
          type: "SEND_MESSAGE_TO_ROOM",
        });
        // this.mRoom.sendMessage(message);
        if (typeof this.mWritingTimerCallback !== "undefined" && this.mWritingTimerCallback !== null) {
          this.mWritingTimerCallback.stop();
          this.mWritingTimerCallback = null;
        }
      }
    } else if (StringUtils.trim(this.mInputField.getValue()).length > 0) {
      writingValue = WritingStatusEvent.WRITING;
      if (typeof this.mWritingTimerCallback === "undefined" || this.mWritingTimerCallback === null) {
        this.sendWritingStatus(writingValue);
        this.mWritingTimerCallback = this.mTimedCallbackFactory.createTimedCallback(
          new Callback(
            this,
            this.onWritingStatusTimeout,
          ),
          this.mTimeoutWrittenStatus,
        );
        this.mWritingTimerCallback.start();
      }
      this.mRestartTimerCallbackOnTimeout = true;
    } else if (
      (typeof this.mWritingTimerCallback === "undefined" || this.mWritingTimerCallback === null) &&
      (DwtKeyEvent.KEY_DELETE || DwtKeyEvent.KEY_BACKSPACE)
    ) {
      this.sendWritingStatus(writingValue);
    }
    return false;
  }

  protected onFocus(): void {
    this.checkAndSendRoomAck();
  }

  protected checkAndSendRoomAck(): void {
    const room: IOpenChatRoom = this.mStore.getState().rooms[this.mRoomJid];
    if (typeof room !== "undefined" && room.messages.length > 0) {
      const message: IOpenChatMessage = room.messages[room.messages.length - 1];
      const username: string = this.mStore.getState().sessionInfo.username;
      if (message.sender !== username) {
        this.mStore.dispatch<ISendRoomAckAction>({
          jid: this.mRoomJid,
          message_id: message.id,
          message_time: message.date,
          type: "SEND_ROOM_ACK",
        });
      }
    }
  }

  private onWritingStatusTimeout(): void {
    if (this.mRestartTimerCallbackOnTimeout) {
      this.mWritingTimerCallback.stop();
      this.mWritingTimerCallback.start();
      this.mRestartTimerCallbackOnTimeout = false;
    } else {
      if (StringUtils.trim(this.mInputField.getValue()).length > 0) {
        this.sendWritingStatus(WritingStatusEvent.WRITTEN);
      } else {
        this.sendWritingStatus(WritingStatusEvent.RESET);
      }
      this.mWritingTimerCallback = null;
    }
  }

  private sendWritingStatus(writingValue: number): void {
    this.mStore.dispatch<IRoomAction>({
      jid: this.getId(),
      type: "SEND_WRITING_STATUS",
      writingStatus: WritingStatusEvent.fromTypeToString(writingValue),
    });
  }

  private onAddMessageSent(message: MessageSent): void {
    // this.mConversation.addMessageSent(message);
  }

  private onAddMessageSentFromAnotherSession(message: MessageSent): void {
    // this.mConversation.addMessageSent(message);
  }

  private onAddMessageReceived(message: MessageReceived): void {
    this.mOnMessageReceivedCallbacks.run(this, message);
    // this.mConversation.addMessageReceived(message);
  }

  private onBuddyWritingStatus(writingStatusValue: number): void {
    this.mBuddyWritingStatuses[this.getId()] = writingStatusValue;
    this.updateWritingDots(writingStatusValue);
  }

  private dragStart(position: DwtPoint): void {
    return;
  }

  // // No more button
  // private sendButtonHandler(): void {
  //   let message: string = StringUtils.trim(this.mInputField.getValue());
  //   this.mInputField.clear();
  //   if (message.length > 0) {
  //     this.mRoom.sendMessage(message);
  //   }
  // }

  private getCurrentInputPosition(inputElement: IExtendedHTMLInputElement): number {
    let caretOffset: number = 0;
    const doc: IExtendedDocument = (inputElement.ownerDocument as IExtendedDocument) || inputElement.document;
    const win: Window = doc.defaultView || doc.parentWindow;
    const sel: IExtendedSelection = doc.selection;
    if (typeof inputElement.selectionStart !== "undefined" && inputElement.selectionStart !== null) {
      // Firefox and IE Support
      if (inputElement.selectionStart > inputElement.value.length) {
        caretOffset = inputElement.value.length;
      } else {
        caretOffset = inputElement.selectionStart;
      }
    } else if (
      typeof win.getSelection !== "undefined"
      && win.getSelection !== null
      && window.getSelection().rangeCount > 0
    ) {
      const range: Range = win.getSelection().getRangeAt(0);
      const preCaretRange: Range = range.cloneRange();
      preCaretRange.selectNodeContents(inputElement);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    } else if (typeof sel !== "undefined" && sel !== null && sel.type !== "Control") {
      const textRange: ITextRange = sel.createRange();
      const preCaretTextRange: ITextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(inputElement);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  // private onMemberRemoved(buddy: IBuddy): void {
  //   // Commented: while doing a register session the reset of the buddy list results in closing all the room windows
  //   // if (this.mRoom.getMembers().length < 1) {
  //   //   this.popdown();
  //   // }
  // }

  // private onBuddyStatusChange(buddy: IBuddy, status: IBuddyStatus): void {
  //   // this.mConversation.addMessageStatus(buddy, status);
  //   this.mRoomWindowPluginManager.triggerPlugins(RoomWindow.BuddyStatusChangedPlugin, status);
  // }

  // private onRoomStatusChange(status: IBuddyStatus): void {
  //   const css: string = BuddyStatus.getCSS(status.getType());
  //   this.setIcon(css);
  // }

  private onEmojiSelected(ev: Event, emoji: IEmojiData): void {
    this.addTextToInput(emoji.name);
    this.mInputField.focus();
  }

  private updateWritingDots(writingStatusValue: number): void {
    writingStatusValue === WritingStatusEvent.WRITING ?
      this.mWritingStatusDots.start()
      : this.mWritingStatusDots.stop();
  }

}

// IE needs the following definitions
interface ITextRange extends Range {
  text: string;
  moveToElementText(inputElement: HTMLInputElement): void;
  setEndPoint(type: string, range: Range): void;
}

interface IExtendedHTMLInputElement extends HTMLInputElement {
  document: IExtendedDocument;
}

interface IExtendedDocument extends Document {
  parentWindow: Window;
  selection: IExtendedSelection;
  body: IExtendedBody;
}

interface IExtendedSelection extends Selection {
  createRange(): ITextRange;
}

interface IExtendedBody extends HTMLElement {
  createTextRange(): ITextRange;
}
