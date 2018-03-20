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

import {Store} from "redux";
import {IMessageUiFactory} from "../../app/messageFactory/IMessageUiFactory";
import {ChatZimletBase} from "../../ChatZimletBase";
import {BuddyStatusType} from "../../client/BuddyStatusType";
import {QueryArchiveEvent} from "../../client/events/chat/QueryArchiveEvent";
import {IRoomManager} from "../../client/IRoomManager";
import {ISessionInfoProvider} from "../../client/ISessionInfoProvider";
import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {CumulativeCallback} from "../../lib/callbacks/CumulativeCallback";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {ContactImg} from "../../lib/ContactImg";
import {IDateProvider} from "../../lib/IDateProvider";
import {Map} from "../../lib/Map";
import {NotificationManager} from "../../lib/notifications/NotificationManager";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {IQueryArchiveAction} from "../../redux/action/IQueryArchiveAction";
import {IOpenChatState} from "../../redux/IOpenChatState";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {IRoomWindowFactory} from "./IRoomWindowFactory";
import {MainWindow} from "./MainWindow";
import {WindowDragTask} from "./manager/WindowDragTask";
import {WindowsMap} from "./manager/WindowsMap";
import {WindowsPositionContainer} from "./manager/WindowsPositionContainer";
import {RoomWindowType} from "./RoomWindow";
import {SmoothRoomWindowMover} from "./SmoothRoomWindowMover";

export class RoomWindowManager {

  public static CreateRoomWindowPluginManager = "Room Window Manager Create RoomWindow Plugin Manager";
  public static AddRoomWindowPlugin = "Room Window Manager Add Room";

  private static RIGHT_PADDING: number = 20;
  private static ANIMATION_TIME: number = 50;

  private static setWindowLocation(
    window: RoomWindowType,
    x: number,
    y: number,
    timing: number = RoomWindowManager.ANIMATION_TIME,
    cbkMgr?: CallbackManager,
  ): void {
    new SmoothRoomWindowMover(
      window,
      new DwtPoint(x, y),
      timing,
      cbkMgr,
    ).start();
  }

  // TODO: maybe we should hold it
  // private static sortByLastActivity(a: RoomWindowType, b: RoomWindowType) {
  //   if (a.getLastRoomActivity() < b.getLastRoomActivity()) {
  //     return -1;
  //   }
  //   if (a.getLastRoomActivity() > b.getLastRoomActivity()) {
  //     return 1;
  //   }
  //   return 0;
  // }

  private static calculateWindowXCenter(window: RoomWindowType): number {
    return Math.round(window.getLocation().x + (window.getSize().x / 2));
  }

  private static calculateWindowYCenter(window: RoomWindowType): number {
    return Math.round(window.getLocation().y + (window.getSize().y / 2));
  }

  private mAppCtxt: ZmAppCtxt;
  private mShell: DwtShell;
  private mNotificationManager: NotificationManager;
  private mZimletContext: ChatZimletBase<IOpenChatState>;
  private mSessionInfoProvider: ISessionInfoProvider;
  private mDateProvider: IDateProvider;
  private mRoomManager: IRoomManager;
  private mWindowsMap: WindowsMap = new WindowsMap();
  private mOpenedWindowsMap: WindowsMap = new WindowsMap();
  private mMainWindow: MainWindow;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mRoomWindowManagerPluginManager: ChatPluginManager;
  private mStore: Store<IOpenChatState>;
  private mRoomWindowFactory: IRoomWindowFactory;
  private mMessageUiFactory: IMessageUiFactory<IOpenChatState>;

  private mDragTasks: Map<WindowDragTask> = new Map();
  private mPositions: WindowsPositionContainer = new WindowsPositionContainer();
  private mWindowsLocked: boolean = false;

  constructor(appCtxt: ZmAppCtxt,
              shell: DwtShell,
              notificationManager: NotificationManager,
              zimletContext: ChatZimletBase<IOpenChatState>,
              timedCallbackFactory: TimedCallbackFactory,
              mainWindow: MainWindow,
              sessionInfoProvider: ISessionInfoProvider,
              dateProvider: IDateProvider,
              roomManager: IRoomManager,
              chatPluginManager: ChatPluginManager,
              store: Store<IOpenChatState>,
              roomWindowFactory: IRoomWindowFactory,
              messageUIFactory: IMessageUiFactory<IOpenChatState>,
  ) {
    (window as IExtendedWindow).debugWM = this;
    this.mAppCtxt = appCtxt;
    this.mShell = shell;
    this.mNotificationManager = notificationManager;
    this.mZimletContext = zimletContext;
    this.mMainWindow = mainWindow;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mDateProvider = dateProvider;
    this.mRoomManager = roomManager;
    this.mRoomWindowManagerPluginManager = chatPluginManager;
    this.mStore = store;
    this.mRoomWindowFactory = roomWindowFactory;
    this.mMessageUiFactory = messageUIFactory;
    this.mRoomWindowManagerPluginManager.switchOn(this);
    // this.mRoomManager.onRoomAdded(new Callback(this, this.onRoomAdded));
    this.mShell.addListener(DwtEvent.CONTROL, new AjxListener(this,  this.onShellResize));
  }

  public getPluginManager(): ChatPluginManager {
    return this.mRoomWindowManagerPluginManager;
  }

  public getSessionInfoProvider(): ISessionInfoProvider {
    return this.mSessionInfoProvider;
  }

  /**
   * Return a room window by id.
   * For a user-to-user chat, the window id is equal to the buddy id
   * @param {string} windowId
   * @return {RoomWindow}
   */
  public getRoomWindowById(windowId: string): RoomWindowType {
    if (typeof this.mWindowsMap.get(windowId) === "undefined") {
      this.createRoomWindow(windowId);
    }
    return this.mWindowsMap.get(windowId);
  }

  public lockdownAllWindows(): void {
    this.closeAllWindows();
    for (const roomWindow of this.mWindowsMap.values()) {
      roomWindow.lockPopup();
    }
    this.mWindowsLocked = true;
  }

  public unlockAllWindows(): void {
    for (const roomWindow of this.mWindowsMap.values()) {
      roomWindow.unlockPopup();
    }
    this.mWindowsLocked = false;
  }

  public closeAllWindows(): void {
    const openedWindows: RoomWindowType[] = this.mOpenedWindowsMap.values();
    for (const roomWindow of openedWindows) {
      roomWindow.popdown();
    }
  }

  /**
   * Function invoked when a message is received.
   * @param {string} roomWindowId
   * @param {string} messageSenderId
   * @param {string} messageContent
   */
  public onMessageReceived(
    roomWindowId: string,
    messageSenderId: string,
    messageContent: string,
  ): void {
    const isLoadingHistory: boolean = this.mStore.getState().rooms[roomWindowId].loadingHistory;
    const roomWindow: RoomWindowType = this.getRoomWindowById(roomWindowId);
    let onBusyStatus: boolean = false;
    for (const userStatus of this.mStore.getState().userStatuses) {
      if (userStatus.type === BuddyStatusType.BUSY && userStatus.selected) {
        onBusyStatus = true;
      }
    }
    if (roomWindow.getChildren().length > 0) {
      roomWindow.popup(undefined, !onBusyStatus);
    }
    if (
      !roomWindow.isFocused() && roomWindow.getChildren().length > 0 && !onBusyStatus &&
      isLoadingHistory !== true
    ) {
      roomWindow.startBlinkTitle();
      let icon = (new ContactImg(messageSenderId)).getImgUrl();
      if (typeof icon === "undefined" || icon === null) {
        icon = this.mZimletContext.getNotificationImage();
      }
      this.mNotificationManager.notify(
        messageContent,
        this.mStore.getState().buddyList.hasOwnProperty(messageSenderId)
          ? this.mStore.getState().buddyList[messageSenderId].nickname
          : messageSenderId,
        icon,
      );
    }
  }

  /**
   * Check if there are enough space in the screen.
   * @param {RoomWindow} window The size to check.
   * @return {boolean}
   * @private
   */
  private hasEnoughSpace(window: RoomWindowType): boolean {
    let occupiedSize: number = this.mMainWindow.getSize().x + RoomWindowManager.RIGHT_PADDING;

    for (const roomWindow of this.mOpenedWindowsMap.values()) {
      if (roomWindow.getId() === window.getId()) { continue; }
      occupiedSize += roomWindow.getSize().x + RoomWindowManager.RIGHT_PADDING;
    }
    return (this.mShell.getSize().x - occupiedSize) >= (window.getSize().x + RoomWindowManager.RIGHT_PADDING);
  }

  /**
   * Manage the adding of a new room
   * @param {string} roomJid
   * @private
   */
  private createRoomWindow(roomJid: string) {
    const roomWindowPluginManager = new ChatPluginManager();
    this.mRoomWindowManagerPluginManager.triggerPlugins(
      RoomWindowManager.CreateRoomWindowPluginManager,
      roomWindowPluginManager,
    );
    const roomWindow: RoomWindowType =
      this.mRoomWindowFactory.createRoomWindow(
        this.mShell,
        this.mTimedCallbackFactory,
        roomJid,
        this.mNotificationManager,
        this.mDateProvider,
        this.mSessionInfoProvider,
        roomWindowPluginManager,
        this.mWindowsLocked,
        this.mMessageUiFactory,
      );
    this.mWindowsMap.put(roomWindow);
    roomWindow.setLastLocation(new DwtPoint(
      this.getXWindowLocation(roomWindow),
      this.getYWindowLocation(roomWindow),
    ));
    this.mPositions.setWindowPosition(roomWindow.getId(), -1);
    roomWindow.onStartDrag(new Callback(this, this.onStartDrag));
    roomWindow.onDuringDrag(new Callback(this, this.onDuringDrag));
    roomWindow.onDragEnd(new Callback(this, this.onDragEnd));
    // roomWindow.onMessageReceived(new Callback(this, this.onMessageReceived));
    roomWindow.onWindowOpened(new Callback(this, this.onWindowOpened));
    roomWindow.onWindowClosed(new Callback(this, this.onWindowClosed));
    roomWindow.onMinimize(new Callback(this, this.moveMinimizedWindow));
    roomWindow.onExpand(new Callback(this, this.moveExpandedWindow));
    this.mRoomWindowManagerPluginManager.triggerPlugins(RoomWindowManager.AddRoomWindowPlugin, roomJid);
  }

  /**
   * Callback function invoked when the mShell is resized.
   * @param {DwtEvent} event The event provided by the system.
   * @private
   */
  private onShellResize(event: DwtEvent) {
    this.updateWindowsPositions();
  }

  /**
   * Get the Location (X) Of a window.
   * @param {RoomWindow} window
   * @return {number} The X Offset of the window.
   * @private
   */
  private getXWindowLocation(window: RoomWindowType): number {
    const currentPosition = this.mPositions.window2position(window.getId());
    let i: number;
    let xLocation: number = this.mShell.getSize().x
        - (window.getSize().x + RoomWindowManager.RIGHT_PADDING)
        - (this.mMainWindow.getSize().x + RoomWindowManager.RIGHT_PADDING);
    let tmpWindow: RoomWindowType;
    let tmpPosition: number;
    const openedWindows: RoomWindowType[] =
      this.mOpenedWindowsMap.values();
    for (i = 0; i < openedWindows.length; i++) {
      tmpPosition = this.mPositions.window2position(openedWindows[i].getId());
      if (tmpPosition >= currentPosition) { continue; }
      tmpWindow = openedWindows[i];
      xLocation -= (tmpWindow.getSize().x + RoomWindowManager.RIGHT_PADDING);
    }
    return xLocation;
  }

  /**
   * Get the Location (Y) Of a window.
   * @param {RoomWindow} window
   * @return {number} The Y Offset of the window.
   * @private
   */
  private getYWindowLocation(window: RoomWindowType): number {
    return this.mShell.getSize().y - window.getSize().y;
  }

  /**
   * Update all the window mPositions.
   * @private
   */
  private updateWindowsPositions(): void {
    const openedWindows: RoomWindowType[] = this.mOpenedWindowsMap.values();
    let i: number;
    const cbkMgr: CallbackManager = new CallbackManager();
    cbkMgr.addCallback(new CumulativeCallback(openedWindows.length, this, this.onAllWindowRelocated));
    for (i = 0; i < openedWindows.length; i++) {
      RoomWindowManager.setWindowLocation(
        openedWindows[i],
        this.getXWindowLocation(openedWindows[i]),
        this.getYWindowLocation(openedWindows[i]),
        void 0,
        cbkMgr,
      );
    }
  }

  /**
   * Callback function invoked when a window is opened.
   * @param window
   * @param point
   */
  private onWindowOpened(window: RoomWindowType, point: DwtPoint): void {
    const position: number = this.mOpenedWindowsMap.size();
    let xLocation: number = 0;
    this.mOpenedWindowsMap.put(window);
    this.mPositions.setWindowPosition(window.getId(), position);

    // Not used anymore because the opened window popup at last position

    // let size: DwtPoint = window.getSize(),
    //   currentPosition: number = this.mPositions.window2position(window.getId()),
    //   openedWindows: RoomWindow[] = this.mOpenedWindowsMap.values(),
    //   tmpPosition: number,
    //   i: number;
    // // Move the opened windows to make space for the room window.
    // for (i = 0; i < openedWindows.length; i++) {
    //   tmpPosition = this.mPositions.window2position(openedWindows[i].getId());
    //   if (tmpPosition <= currentPosition) continue;
    //   RoomWindowManager.setWindowLocation(
    //     openedWindows[i],
    //     this.getXWindowLocation(openedWindows[i]),
    //     this.getYWindowLocation(openedWindows[i])
    //   );
    // }

    if (typeof point !== "undefined") {
      window.setLocation(
        point.x,
        point.y,
      );
    } else {
      if (!this.hasEnoughSpace(window)) {
        this.tryToMakeRoomForWindow(window);
      }
      xLocation = this.getXWindowLocation(window);
      window.setLocation(
        xLocation,
        this.getYWindowLocation(window),
      );
    }
    // // if (this.mRoomManager.isStatusBusy()) {
    // if (this.mZimletContext.getClient().getCurrentStatus().getType() === BuddyStatusType.BUSY) {
    //   window.setMinimized();
    // }
  }

  /**
   * Handle the notification of a closed window.
   * @param {RoomWindowType} window
   * @private
   */
  private onWindowClosed(window: RoomWindowType): void {
    this.mOpenedWindowsMap.remove(window.getId());
    const currentPosition: number = this.mPositions.window2position(window.getId());
    let tmpPosition: number;
    this.mPositions.setWindowPosition(window.getId(), -1);
    // before getWindowLocation is necessary to update all mPositions
    for (const openedWindow of this.mOpenedWindowsMap.values()) {
      tmpPosition = this.mPositions.window2position(openedWindow.getId());
      if (tmpPosition < currentPosition) { continue; }
      this.mPositions.setWindowPosition(openedWindow.getId(), tmpPosition - 1);
    }
    for (const openedWindow of this.mOpenedWindowsMap.values()) {
      tmpPosition = this.mPositions.window2position(openedWindow.getId());
      if (tmpPosition < currentPosition) { continue; }
      RoomWindowManager.setWindowLocation(
        openedWindow,
        this.getXWindowLocation(openedWindow),
        this.getYWindowLocation(openedWindow),
      );
    }
  }

  private onStartDrag(roomWindow: RoomWindowType, x: number, y: number): void {
    const dragTask: WindowDragTask = new WindowDragTask(roomWindow);
    this.mDragTasks.put(roomWindow.getId(), dragTask);
    // roomWindow.setZIndex(parseInt(`${roomWindow.getZIndex()}`, 10) + 1);
  }

  private onDuringDrag(roomWindow: RoomWindowType, x: number, y: number): void {
    // let dragTask: WindowDragTask = this.mDragTasks.get(roomWindow.getId());
    // if (typeof dragTask === "undefined") return;
  }

  private onDragEnd(roomWindow: RoomWindowType, x: number, y: number): void {
    const dragTask: WindowDragTask = this.mDragTasks.get(roomWindow.getId());
    const xCenter: number = RoomWindowManager.calculateWindowXCenter(roomWindow);
    const currentPosition: number = this.mPositions.window2position(roomWindow.getId());
    let firstXLocation: number = this.mMainWindow.getBuddyListTree().getLocation().x;
    let tmpPosition: number = -1;
    const bufferPositions: WindowsPositionContainer = new WindowsPositionContainer();
    // roomWindow.setZIndex(dragTask.getOriginalZIndex());
    if (typeof dragTask === "undefined") { return; }
    if (!dragTask.isReallyMoved(x, y)) {
      if (roomWindow.isMinimized())  {
        roomWindow.setExpanded();
      } else { roomWindow.setMinimized(); }
    } else {
      // Check if the window is dropped over another window, swap them.
      for (const openedWindow of this.mOpenedWindowsMap.values()) {
        if (openedWindow.getId() === roomWindow.getId()) { continue; }
        if (openedWindow.getLocation().x < firstXLocation) {
          firstXLocation = openedWindow.getLocation().x;
        }
        if (xCenter > (openedWindow.getLocation().x - (RoomWindowManager.RIGHT_PADDING / 2))
          && xCenter < (openedWindow.getLocation().x
            + openedWindow.getSize().x
            + (RoomWindowManager.RIGHT_PADDING / 2))
        ) {
          // The window is dropped inside another window
          tmpPosition = this.mPositions.window2position(openedWindow.getId());
          this.mPositions.setWindowPosition(openedWindow.getId(), currentPosition);
          this.mPositions.setWindowPosition(roomWindow.getId(), tmpPosition);
          RoomWindowManager.setWindowLocation(
            roomWindow,
            this.getXWindowLocation(roomWindow),
            this.getYWindowLocation(roomWindow),
          );
          RoomWindowManager.setWindowLocation(
            openedWindow,
            this.getXWindowLocation(openedWindow),
            this.getYWindowLocation(openedWindow),
          );
          return;
        }
      }
      // The window is dropped in the empty area, move the remainig window as the first from left.
      if (roomWindow.getLocation().x < firstXLocation) {
        for (const openedWindow of this.mOpenedWindowsMap.values()) {
          if (openedWindow.getId() === roomWindow.getId()) { continue; }
          tmpPosition = this.mPositions.window2position(openedWindow.getId());
          if (tmpPosition > currentPosition) {
            bufferPositions.setWindowPosition(openedWindow.getId(), tmpPosition - 1);
          }
        }
        this.mPositions.setWindowPosition(roomWindow.getId(), this.mOpenedWindowsMap.values().length - 1);
        for (const openedWindow of this.mOpenedWindowsMap.values()) {
          if (typeof bufferPositions.window2position(openedWindow.getId()) === "number") {
            this.mPositions.setWindowPosition(
              openedWindow.getId(),
              bufferPositions.window2position(openedWindow.getId()),
            );
          }
        }
      }
      this.updateWindowsPositions();
    }
    this.mDragTasks.remove(roomWindow.getId());
  }

  /**
   * Move a window when is minimized. The window is autonomously resized, but need to be relocated.
   * @param {RoomWindowType} roomWindow The window to move.
   * @param {boolean} save The save flag passed by the window. (Not used)
   * @private
   */
  private moveMinimizedWindow(roomWindow: RoomWindowType, save: boolean): void {
    new SmoothRoomWindowMover(
      roomWindow,
      new DwtPoint(
        roomWindow.getLocation().x,
        this.getYWindowLocation(roomWindow),
      ),
      0,
    ).start();
  }

  /**
   * Move a window when is expanded. The window is autonomously resized, but need to be relocated.
   * @param {RoomWindowType} roomWindow The window to move.
   * @param {boolean} save The save flag passed by the window. (Not used)
   * @private
   */
  private moveExpandedWindow(roomWindow: RoomWindowType, save: boolean): void {
    new SmoothRoomWindowMover(
      roomWindow,
      new DwtPoint(
        roomWindow.getLocation().x,
        this.getYWindowLocation(roomWindow),
      ),
      0,
    ).start();
  }

  /**
   * Callback function invoked when all windows are relocated, relocation triggered by the
   * {@see RoomWindowManager.prototype.updateWindowsPositions} function.
   * @private
   */
  private onAllWindowRelocated(): void {
    const toClose: RoomWindowType[] = [];
    for (const openedWindow of this.mOpenedWindowsMap.values()) {
      if (openedWindow.getLocation().x >= 0) { continue; }
      toClose.push(openedWindow);
    }

    for (const windowToBeClosed of toClose) {
      windowToBeClosed.popdown();
    }
  }

  /**
   * Try to create enough space to open a window safely, avoiding to open it outside the screen.
   * @param {RoomWindow} window
   * @private
   */
  private tryToMakeRoomForWindow(window: RoomWindowType): void {
    // this.mOpenedWindowsMap.values().sort(RoomWindowManager.sortByLastActivity);
    for (const openedWindow of this.mOpenedWindowsMap.values()) {
      openedWindow.popdown();
      if (this.hasEnoughSpace(window)) { break; }
    }
  }

}

interface IExtendedWindow extends Window {
  debugWM: RoomWindowManager;
}
