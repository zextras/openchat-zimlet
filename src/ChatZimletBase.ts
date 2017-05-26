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

import {ZmZimletBase} from "./zimbra/zimbraMail/share/model/ZmZimletBase";
import {ZimbraPatcher} from "./lib/ZimbraPatcher";
import {LogEngine} from "./lib/log/LogEngine";
import {Logger} from "./lib/log/Logger";
import {emojione} from "./libext/emojione";
import {Callback} from "./lib/callbacks/Callback";
import {ZmSetting} from "./zimbra/zimbraMail/share/model/ZmSetting";
import {StringUtils} from "./lib/StringUtils";
import {ZmStatusView} from "./zimbra/zimbraMail/share/view/ZmStatusView";
import {Version} from "./lib/Version";
import {SettingsManager, GroupsData} from "./settings/SettingsManager";
import {Setting} from "./settings/Setting";
import {ChatClient} from "./client/ChatClient";
import {NotificationManager} from "./lib/notifications/NotificationManager";
import {Group} from "./client/Group";
import {MainWindow} from "./dwt/windows/MainWindow";
import {AjxListener} from "./zimbra/ajax/events/AjxListener";
import {RoomWindowManager} from "./dwt/windows/RoomWindowManager";
import {ObjectHandler} from "./objectHandler/ObjectHandler";
import {ZmObjectManager} from "./zimbra/zimbraMail/share/model/ZmObjectManager";
import {ZmNewWindow} from "./zimbra/zimbraMail/core/ZmNewWindow";
import {DwtMessageDialog} from "./zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {DwtDialog} from "./zimbra/ajax/dwt/widgets/DwtDialog";
import {IdGenerator} from "./dwt/IdGenerator";
import {EventSessionRegistered} from "./client/events/chat/EventSessionRegistered";
import {TimedCallback} from "./lib/callbacks/TimedCallback";
import {ZxError} from "./lib/error/ZxError";
import {ZxErrorCode} from "./lib/error/ZxErrorCode";
import {ZmCsfeException} from "./zimbra/zimbra/csfe/ZmCsfeException";
import {AjxException} from "./zimbra/ajax/core/AjxException";
import {BuddyStatus} from "./client/BuddyStatus";
import {RemoveFriendshipEvent} from "./client/events/chat/RemoveFriendshipEvent";
import {IdleTimer} from "./lib/IdleTimer";
import {BuddyStatusType} from "./client/BuddyStatusType";
import {DwtSelectionEvent} from "./zimbra/ajax/dwt/events/DwtSelectionEvent";
import {Buddy} from "./client/Buddy";
import {BuddyTreeItem} from "./dwt/widgets/BuddyTreeItem";
import {RoomWindow} from "./dwt/windows/RoomWindow";
import {DeleteBuddyDialog} from "./dwt/dialogs/DeleteBuddyDialog";
import {RenameBuddyDialog} from "./dwt/dialogs/RenameBuddyDialog";
import {AcceptFriendshipDialog} from "./dwt/dialogs/AcceptFriendshipDialog";
import {AddGroupDialog} from "./dwt/dialogs/AddGroupDialog";
import {SettingsDialog} from "./dwt/dialogs/SettingsDialog";
import {RenameGroupDialog} from "./dwt/dialogs/RenameGroupDialog";
import {GroupTreeItem} from "./dwt/widgets/GroupTreeItem";
import {ZmContact} from "./zimbra/zimbraMail/abook/model/ZmContact";
import {HTMLUtils} from "./lib/HTMLUtils";
import {GroupStats} from "./client/GroupStats";
import {Room} from "./client/Room";
import {AddBuddyDialog} from "./dwt/dialogs/AddBuddyDialog";
import {RoomManager} from "./client/RoomManager";
import {TimedCallbackFactory} from "./lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "./lib/DateProvider";
import {SessionInfoProvider} from "./client/SessionInfoProvider";
import {ConnectionManager} from "./client/connection/ConnectionManager";
import {EventManager} from "./client/events/EventManager";
import {ChatPluginManager} from "./lib/plugin/ChatPluginManager";
import {ZmMailMsg} from "./zimbra/zimbraMail/mail/model/ZmMailMsg";
import {ZimletVersion} from "./ZimletVersion";
import {DwtEvent} from "./zimbra/ajax/dwt/events/DwtEvent";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {JQueryPlugins} from "./jquery/JQueryPlugins";
import {LoadingDotsPlugin} from "./jquery/LoadingDotsPlugin";
import {TextCompletePlugin} from "./jquery/TextCompletePlugin";

export class ChatZimletBase extends ZmZimletBase {

  private static RETRY_CONNECT_TIMEOUT: number = 300000;
  private static TIMEOUT_502_DISMISS: number = 300000;
  private static EMOJI_ASSETS_PATH: string = "";

  static alreadyInit: boolean;
  static INSTANCE: ChatZimletBase;

  protected Log: Logger = LogEngine.getLogger(LogEngine.CHAT);
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mDateProvider: DateProvider;
  private mSettingsManager: SettingsManager;
  private mSessionInfoProvider: SessionInfoProvider;
  private mConnectionManager: ConnectionManager;
  private mEventManager: EventManager;
  private mRoomManager: RoomManager;
  private mIdleTimer: IdleTimer;
  private mMainWindow: MainWindow;
  private mChatClient: ChatClient;
  private mObjectHandler: ObjectHandler;
  private mPoweredByAlreadyShown: boolean;
  private mUpdateNotified: boolean;
  private mOnline: boolean;
  private mCoreNotFoundNotified: boolean;
  private m502Errors: number;
  private mNotificationManager: NotificationManager;
  private mStoreGroupsDataCallback: Callback;
  private mRoomWindowManager: RoomWindowManager;
  private mUserStatuses: BuddyStatus[];
  private mLastStatus: BuddyStatus;

  private mAddBuddyDialog: AddBuddyDialog;
  private mAddGroupDialog: AddGroupDialog;
  private mDeleteGroupDialog: DwtMessageDialog;
  private mWarnDeleteGroupDialog: DwtMessageDialog;

  private mRequiredCoreVersion: Version;
  private mCoreVersion: Version;
  private mJQueryPlugins: JQueryPlugins;

  constructor() {
    super(); // Do nothing
    if (typeof ChatZimletBase.INSTANCE === "undefined" || ChatZimletBase.INSTANCE === null) {
      ChatZimletBase.INSTANCE = this;
    }
    let originalConfirmExitMethod: Function = ZmNewWindow._confirmExitMethod;
    ZmNewWindow._confirmExitMethod = <() => void>(new Callback(this, this.clientShutdownBeforeExit, originalConfirmExitMethod)).toClosure();
    window.onbeforeunload = ZmNewWindow._confirmExitMethod;
    this.mJQueryPlugins = new JQueryPlugins(
      new LoadingDotsPlugin(),
      new TextCompletePlugin()
    );
  }

  private clientShutdownBeforeExit(originalConfirmExitMethod: Function, event: DwtEvent): void {
    if (typeof this.getClient() !== "undefined" && this.getClient() !== null) {
      this.getClient().shutdown();
    }
    originalConfirmExitMethod(event);
  }

  public initChatZimlet(
    timedCallbackFactory: TimedCallbackFactory,
    dateProvider: DateProvider,
    settingsManager: SettingsManager,
    sessionInfoProvider: SessionInfoProvider,
    connectionManager: ConnectionManager,
    eventManager: EventManager,
    roomManagerPluginManager: ChatPluginManager,
    chatClientPluginManager: ChatPluginManager,
    mainWindowPluginManager: ChatPluginManager,
    roomWindowManagerPluginManager: ChatPluginManager
  ): void {

    ZimbraPatcher.patch();
    this.Log.debug("Zimbra patched", "ChatZimletBase");
    this.mJQueryPlugins.installPlugins();
    this.Log.debug("JQuery", "Added plugins");
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mDateProvider = dateProvider;
    this.mSettingsManager = settingsManager;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mConnectionManager = connectionManager;
    this.mEventManager = eventManager;
    this.mRoomManager = new RoomManager(
      this.mDateProvider,
      roomManagerPluginManager
    );
    emojione.setSprites(true);
    emojione.setAscii(true);
    emojione.setUnicodeAlt(false);
    emojione.setCacheBustParams("");
    emojione.setImagePath(this.getResource(ChatZimletBase.EMOJI_ASSETS_PATH));

    let zimbraVersion: string = appCtxt.get(ZmSetting.CLIENT_VERSION);
    if (typeof zimbraVersion === "undefined" || zimbraVersion === null) {
      zimbraVersion = "0";
    }
    let zimbraMajorVersion: string = zimbraVersion.substring(0, 1);

    if (zimbraMajorVersion < "7") {
      if (zimbraMajorVersion === "0") {
        this.displayStatusMessage(
          {
            msg: StringUtils.getMessage("undetectable_zimbra_version"),
            level: ZmStatusView.LEVEL_CRITICAL
          }
        );
      }
      else {
        this.displayStatusMessage(
          {
            msg: StringUtils.getMessage("zimbra_not_supported"),
            level: ZmStatusView.LEVEL_CRITICAL
          }
        );
        return;
      }
    }

    this.mRequiredCoreVersion    = new Version("1.00");
    this.mCoreVersion             = new Version("0.00");

    this.mPoweredByAlreadyShown = false;
    this.mUpdateNotified = false;

    this.mOnline = false;
    this.mCoreNotFoundNotified = false;
    this.m502Errors = 0;

    this.mChatClient = new ChatClient(
      this.mSessionInfoProvider,
      this.mDateProvider,
      this.mConnectionManager,
      this.mEventManager,
      this.mRoomManager,
      chatClientPluginManager
    );
    this.mChatClient.onRegistrationError(new Callback(this, this.registrationErrorCallback));
    this.mChatClient.onServerOnline(new Callback(this, this.handleServerOnline));
    this.mChatClient.onServerOffline(new Callback(this, this.handleServerOffline));
    this.mChatClient.onProxyError(new Callback(this, this.handle502Error));
    this.mChatClient.onStatusChange(new Callback(this, this.setStatusAsCurrent));
    this.mChatClient.onEndProcessResponses(new Callback(this, this.onEndProcessResponses));

    this.mNotificationManager = new NotificationManager(
        StringUtils.getMessage("default_notification_title"),
        location.protocol + "//" + location.hostname + (this.getResource("images/desktop-chat_128.png")),
        this.mTimedCallbackFactory,
        appCtxt
    );
    this.mNotificationManager.setSoundEnabled(
      this.mSettingsManager.get(Setting.IM_PREF_NOTIFY_SOUNDS)
    );
    this.mNotificationManager.setTitlebarEnabled(
      this.mSettingsManager.get(Setting.IM_PREF_FLASH_BROWSER)
    );
    this.mNotificationManager.setDesktopEnabled(
      this.mSettingsManager.get(Setting.IM_PREF_DESKTOP_ALERT)
    );
    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_NOTIFY_SOUNDS,
      new Callback(this.mNotificationManager, this.mNotificationManager.setSoundEnabled)
    );
    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_FLASH_BROWSER,
      new Callback(this.mNotificationManager, this.mNotificationManager.setTitlebarEnabled)
    );
    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_DESKTOP_ALERT,
      new Callback(this.mNotificationManager, this.mNotificationManager.setDesktopEnabled)
    );
    let userGroupsData: GroupsData = this.mSettingsManager.loadGroupsData();
    for (let groupData of (<{name: string}[]>userGroupsData)) {
      this.mChatClient.getBuddyList().addGroup(new Group(groupData.name));
    }

    this.mMainWindow = new MainWindow(
      appCtxt,
      this.mSettingsManager,
      this.mChatClient.getBuddyList(),
      mainWindowPluginManager
    );

    this.mMainWindow.onStatusSelected(new Callback(this, this.statusSelected));
    this.mMainWindow.onAddFriendOptionSelected(new Callback(this, this.addBuddy));
    this.mMainWindow.onAddGroupOptionSelected(new Callback(this, this.addGroup));
    this.mMainWindow.onSettingsOptionSelected(new Callback(this, this.showSettings));
    this.mMainWindow.onRenameGroup(new Callback(this, this.renameGroup));
    this.mMainWindow.onDeleteGroup(new Callback(this, this.deleteGroup));
    this.mMainWindow.onBuddySelected(new Callback(this, this.buddySelected));
    this.mMainWindow.onDeleteBuddy(new Callback(this, this.deleteBuddy));
    this.mMainWindow.onRenameBuddy(new Callback(this, this.renameBuddy));
    this.mMainWindow.onSendInvitation(new Callback(this, this.sendInvitation));
    this.mMainWindow.onAcceptInvitation(new Callback(this, this.acceptInvitation));
    this.mMainWindow.onBuddyDroppedInGroup(new Callback(this, this.changeBuddyGroup));
    this.mMainWindow.onContactDroppedInGroup(new Callback(this, this.contactDroppedInGroup));
    this.mMainWindow.setShowHideOffline(this.mSettingsManager.get(Setting.IM_PREF_HIDE_OFFLINE));
    this.mMainWindow.setSortMethod(this.mSettingsManager.get(Setting.IM_PREF_BUDDY_SORT));
    this.mMainWindow.onShowHideOffline(new Callback(this, this.onShowHideOffline));

    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_BUDDY_SORT,
      new Callback(this.mMainWindow, this.mMainWindow.sortMethodSet)
    );

    let onDock: boolean = this.mSettingsManager.get(Setting.IM_USR_PREF_DOCK) || true;
    if ((typeof onDock === "undefined" || onDock === null) || onDock) {
      this.mMainWindow.popup();
      // this.mMainWindow.changeSidebarOrDock(true);
      let isUp: boolean = this.mSettingsManager.get(Setting.IM_USR_PREF_DOCK_UP);
      if (isUp) {
        this.mMainWindow.setExpanded(false);
      }
      else {
        this.mMainWindow.setMinimized(false);
      }
    }
    // else {
    //   this.mMainWindow.changeSidebarOrDock(false);
    // }

    // this.mMainWindow.onChangeSidebarOrDock(new Callback(this, this.onChangeSidebarOrDock));
    this.mStoreGroupsDataCallback = new Callback(this.mSettingsManager, this.mSettingsManager.storeGroupsData, this.mMainWindow);
    this.mChatClient.getBuddyList().onAddGroup(this.mStoreGroupsDataCallback);
    this.mChatClient.getBuddyList().onRemoveGroup(this.mStoreGroupsDataCallback);
    this.mChatClient.getBuddyList().onRenameGroup(this.mStoreGroupsDataCallback);

    // Set the visibility of loaded groups and show the main window
    this.mMainWindow.setGroupsData(userGroupsData);
    this.mMainWindow.onGroupExpandedOrCollapsed(new Callback(this, this.onGroupExpandedOrCollapsed));

    this.mRoomWindowManager = new RoomWindowManager(
      appCtxt,
      appCtxt.getShell(),
      this.mNotificationManager,
      this,
      this.mTimedCallbackFactory,
      this.mMainWindow,
      this.mSessionInfoProvider,
      this.mDateProvider,
      this.mRoomManager,
      roomWindowManagerPluginManager
    );

    this.mChatClient.onFriendshipInvitation(new Callback(this, this.handleNewFriendshipInvitation));
    this.mObjectHandler = new ObjectHandler();
    this.mObjectHandler.setEmojiEnabledInConv(this.mSettingsManager.enabledEmojiInChatConversation());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_EMOJI_IN_CONV,
      new Callback(this.mObjectHandler, this.mObjectHandler.setEmojiEnabledInConv)
    );
    this.mObjectHandler.setEmojiEnabledInHist(this.mSettingsManager.enabledEmojiInChatHistory());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_EMOJI_IN_HIST,
      new Callback(this.mObjectHandler, this.mObjectHandler.setEmojiEnabledInHist)
    );
    this.mObjectHandler.setEmojiEnabledInMail(this.mSettingsManager.enabledEmojiInMail());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_EMOJI_IN_MAIL,
      new Callback(this.mObjectHandler, this.mObjectHandler.setEmojiEnabledInMail)
    );
    ZmObjectManager.registerHandler(this.mObjectHandler, null, this._zimletContext.priority);
    this.mTimedCallbackFactory.createTimedCallback(
      new Callback(this.mChatClient, this.mChatClient.registerSession),
      100
    ).start();
  }

  /**
   * Getters
   */
  public static getVersion(): Version {
    let version: Version = new Version(ZimletVersion.VERSION);
    version.setCommit(ZimletVersion.COMMIT);
    return version;
  }

  public getClient(): ChatClient {
    return this.mChatClient;
  }

  public getMainWindow(): MainWindow {
    return this.mMainWindow;
  }

  public getRoomWindowManager(): RoomWindowManager {
    return this.mRoomWindowManager;
  }

  private needUpdate(
    requiredZimletVersion: Version,
    coreVersionDeclared: Version
  ): boolean {
    let needUpdate = false;
    if (ChatZimletBase.getVersion().lessThan(requiredZimletVersion)) {
      let updateMessage: DwtMessageDialog = new DwtMessageDialog(
        {
          buttons: [DwtDialog.DISMISS_BUTTON],
          parent: appCtxt.getShell(),
          id: IdGenerator.generateId("ZxChat_UpgradeZimletMessageDialog")
        }
      );
      updateMessage.setMessage(
        StringUtils.getMessage("need_update_zimlet") +
        "<br/>Current <b>ZxChat Zimlet</b> version: " +
        ChatZimletBase.getVersion().toString() +
        "<br/> Needed <b>ZxChat Zimlet</b> version: " +
        requiredZimletVersion
      );
      updateMessage.popup();
      needUpdate = true;
    }
    if (coreVersionDeclared.lessThan(this.mRequiredCoreVersion) && !needUpdate) {
      let updateMessage: DwtMessageDialog = new DwtMessageDialog({
        buttons: [DwtDialog.DISMISS_BUTTON],
        parent: appCtxt.getShell(),
        id: IdGenerator.generateId("ZxChat_UpgradeCoreMessageDialog")
      });
      updateMessage.setMessage(
        StringUtils.getMessage("need_update_core") +
        "<br/>Current <b>ZxChat Core</b> version: " +
        coreVersionDeclared +
        "<br/> Needed <b>ZxChat Core</b> version: " +
        this.mRequiredCoreVersion
      );
      updateMessage.popup();
      needUpdate = true;
    }
    return needUpdate;
  }

  private handleServerOnline(eventServerInfo: EventSessionRegistered): void {
    this.mOnline = true;
    this.mCoreNotFoundNotified = false;
    let requiredVersion: Version = new Version(eventServerInfo.getInfo("required_zimlet_version"));
    this.mCoreVersion = new Version(eventServerInfo.getInfo("server_version"));

    if (this.needUpdate(requiredVersion, this.mCoreVersion)) {
      return;
    }

    this.mMainWindow.setCurrentStatus(this.mChatClient.getCurrentStatus());
    this.mUserStatuses = [
      new BuddyStatus(BuddyStatusType.ONLINE, "", 1),
      new BuddyStatus(BuddyStatusType.BUSY, "", 2),
      new BuddyStatus(BuddyStatusType.AWAY, "", 3),
      new BuddyStatus(BuddyStatusType.INVISIBLE, "", 4)
    ];
    this.mChatClient.getPluginManager().triggerPlugins(ChatClient.SetStatusesPlugin, this.mUserStatuses);
    let currentStatus: BuddyStatus = this.mChatClient.getCurrentStatus();
    this.mMainWindow.setCurrentStatus(currentStatus);
    this.mMainWindow.setUserStatuses(this.mUserStatuses);

    this.mChatClient.startPing();

    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_REPORT_IDLE,
      new Callback(this, this.reportIdle)
    );

    if (this.mSettingsManager.get(Setting.IM_PREF_REPORT_IDLE)) {
      this.startIdleTimer();
    }

    let checkPendingRequestTimedCallback: TimedCallback = new TimedCallback(
      new Callback(this, this.checkPendingRequest),
      5000
    );
    checkPendingRequestTimedCallback.start();
  }

  private reportIdle(reportIdle: boolean) {
    if (reportIdle) {
      this.startIdleTimer();
    }
    else {
      this.stopIdleTimer();
    }
  }

  private handleServerOffline() {
    let oldValue: boolean = this.mOnline;
    this.mOnline = false;
    if (oldValue) {
      this.displayStatusMessage(
        {
          msg: StringUtils.getMessage("error_contact_server"),
          level: ZmStatusView.LEVEL_CRITICAL
        }
      );
    }
  }

  private handle502Error(error: ZxError) {
    this.m502Errors += 1;
    this.Log.err(error, "Proxy Error found");
    if (this.m502Errors === 3) {
      let msgDialog: DwtMessageDialog = new DwtMessageDialog({
        buttons: [DwtDialog.DISMISS_BUTTON],
        parent: appCtxt.getShell()
      });
      msgDialog.setMessage(
        StringUtils.getMessage("error_502_message", [error.getDetail("detail").toString()]),
        DwtMessageDialog.WARNING_STYLE,
        StringUtils.getMessage("error_502_title")
      );
      msgDialog.popup();
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(msgDialog, msgDialog.popdown),
        ChatZimletBase.TIMEOUT_502_DISMISS
      ).start();
    }
  }

  private registrationErrorCallback(error: ZxError): boolean {
    let msg: string;
    if (
      typeof error !== "undefined" && error !== null &&
      typeof error.getCause !== "undefined" && typeof error.getCause() !== "undefined" && error.getCause() !== null &&
      typeof error.getCause().getCode !== "undefined" && error.getCause().getCode !== null && error.getCause().getCode() === ZxErrorCode.DELEGATED_OR_RESOURCES_NOT_ALLOWED_TO_CHAT
    ) {
      this.mSettingsManager.DELEGATED_ACCESS = true;
      msg = StringUtils.getMessage("delegated_or_resources_not_allowed");
      this.mMainWindow.setMinimized();
      this.mMainWindow.setEnabled(false);
      this.mMainWindow.changeSidebarOrDock(true);
    } else {
      msg = StringUtils.getMessage("zxchat_core_missing_body");
    }
    if (!this.mCoreNotFoundNotified) {
      this.mCoreNotFoundNotified = true;
      this.displayStatusMessage(
        {
          msg: msg,
          level: ZmStatusView.LEVEL_WARNING
        }
      );
    }
    if (this.registrationShouldRetry(error)) {
      this.Log.warn(
        "Trying in " + (ChatZimletBase.RETRY_CONNECT_TIMEOUT / 1000) + "s",
        "Register session error"
      );
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(this.mChatClient, this.mChatClient.registerSession),
        ChatZimletBase.RETRY_CONNECT_TIMEOUT
      ).start();
    }
    else {
      if (this.mSettingsManager.DELEGATED_ACCESS) {
        this.Log.warn(
          error,
          "Register session error"
        );
      }
      else {
        this.Log.warn(
          error,
          "Register session error"
        );
      }
    }
    return true;
  }

  private registrationShouldRetry(error: ZxError): boolean {
    let digested: ZxError = ZxError.convertError(error);
    if (typeof digested.getCode === "undefined" ||
      digested.getCode() === null ||
      ! digested.getDetail("code")
    ) {
      this.Log.err(error, "Cannot retry register session, has not code");
      return false;
    }
    if (
      digested.getCode() === ZxErrorCode.ZM_CSFE_EXCEPTION &&
        digested.getDetail("code") === ZmCsfeException.SVC_UNKNOWN_DOCUMENT
    ) {
      return true;
    }
    if (
      digested.getCode() === ZxErrorCode.AJX_EXCEPTION &&
      digested.getDetail("code") === AjxException.CANCELED
    ) {
      return true;
    }
    this.Log.warn(error, "Cannot retry register session");
    return false;
  }

  private setStatusAsCurrent(status: BuddyStatus) {
    this.mMainWindow.setCurrentStatus(status);
    if (typeof this.mIdleTimer !== "undefined" && this.mIdleTimer !== null && this.mIdleTimer.isIdle()) {
      this.handleIdle(this.mIdleTimer.isIdle());
    }
  }

  private handleIdle(idleStatus: boolean): void {
    let idleString: string = idleStatus ? "Away" : "Presence detected",
      currentStatusType: BuddyStatusType = this.mChatClient.getCurrentStatus().getType();
    this.Log.debug(idleString, "Invoked Auto-Away routine");
    let firstAway: BuddyStatus;
    for (let status of this.mUserStatuses) {
      if (status.getType() === BuddyStatusType.AWAY) {
        firstAway = status;
        break;
      }
    }
    if (typeof firstAway === "undefined" || firstAway === null) {
      return;
    }

    if (
        idleStatus === true &&
        (
          currentStatusType !== BuddyStatusType.AWAY &&
          currentStatusType !== BuddyStatusType.BUSY &&
          currentStatusType !== BuddyStatusType.INVISIBLE
        )
    ) {
      this.mLastStatus = this.mChatClient.getCurrentStatus();
      this.mChatClient.setUserAutoAwayStatus(
        firstAway
      );
    }
    if (
      idleStatus === false &&
      (
        currentStatusType === BuddyStatusType.AWAY ||
        currentStatusType === BuddyStatusType.BUSY ||
        currentStatusType === BuddyStatusType.INVISIBLE
      )
    ) {
      this.mChatClient.setUserStatus(this.mLastStatus);
      this.mLastStatus = undefined;
    }
  }

  private startIdleTimer() {
    try {
      if (typeof this.mIdleTimer === "undefined" || this.mIdleTimer === null) {
        this.mIdleTimer = new IdleTimer (
          this.mSettingsManager.get(Setting.IM_PREF_IDLE_TIMEOUT) * 60000,
          new Callback(this, this.handleIdle)
        );
        this.mSettingsManager.onSettingChange(
          Setting.IM_PREF_IDLE_TIMEOUT,
          new Callback(this, this.setIdleTime)
        );
      }
      else {
        this.setIdleTime(
          this.mSettingsManager.get(Setting.IM_PREF_IDLE_TIMEOUT)
        );
        this.mIdleTimer.start();
      }
    }
    catch (error) {
      this.Log.err(error, "Unable to start Idle");
    }
  }

  private setIdleTime(newTimeMinutes: number) {
    if (typeof this.mIdleTimer !== "undefined" && this.mIdleTimer !== null) {
      this.mIdleTimer.setTime(newTimeMinutes * 60000);
      this.Log.debug(newTimeMinutes + " minute" + (newTimeMinutes === 1 ? "" : "s"), "New idle time set");
    }
  }

  private stopIdleTimer() {
    if (typeof this.mIdleTimer !== "undefined" && this.mIdleTimer !== null) {
      this.mIdleTimer.stop();
    }
  }

  private onEndProcessResponses(): void {
    this.mMainWindow.triggerSortGroups();
  }

  public setStatus(status: BuddyStatus): void {
    if (status.getType() !== this.mChatClient.getCurrentStatus().getType()) {
      this.mChatClient.setUserStatus(status);
    }
    this.mMainWindow.setCurrentStatus(this.mChatClient.getCurrentStatus());
  }

  private statusSelected(status: BuddyStatus): void {
    let callback: Callback = new Callback(this, this.setStatus);
    this.mChatClient.getPluginManager().triggerPlugins(ChatClient.StatusSelectedPlugin, status, callback);
    callback.run(status);
  }

  private buddySelected(event: DwtSelectionEvent): void {
    let buddyTreeItemSelected: BuddyTreeItem = <BuddyTreeItem> event.dwtObj,
      buddy: Buddy = buddyTreeItemSelected.getBuddy(),
      buddyStatus: BuddyStatus = buddy.getStatus();
    if (buddyStatus.getType() === BuddyStatusType.INVITED) {
      if (typeof buddyTreeItemSelected.onAction !== "undefined" && buddyTreeItemSelected.onAction === null) {
        buddyTreeItemSelected.onAction(event);
      }
    }
    else if (buddyStatus.getType() === BuddyStatusType.NEED_RESPONSE) {
      this.acceptInvitation(buddy);
    }
    else {
      let roomWindow: RoomWindow = this.mRoomWindowManager.getRoomWindowById(buddy.getId());
      if (typeof roomWindow === "undefined" || roomWindow === null) {
        let roomPluginManager = new ChatPluginManager();
        let room: Room = this.mChatClient.getRoomManager().createRoom(buddy.getId(), buddy.getNickname(), roomPluginManager);
        room.addMember(buddy);
      }
      roomWindow = this.mRoomWindowManager.getRoomWindowById(buddy.getId());
      if (!roomWindow.isPoppedUp()) {
        roomWindow.popup();
      }
      if (roomWindow.isMinimized()) {
        roomWindow.setExpanded();
      }
      roomWindow.focus();
    }
  }

  private deleteBuddy(buddy: Buddy): void {
    let dialog: DeleteBuddyDialog = DeleteBuddyDialog.getDialog(
      appCtxt.getShell(),
      this.mChatClient,
      new Callback(this, this.onBuddyDeleted)
    );
    dialog.setBuddy(buddy);
    dialog.popup();
  }

  public onBuddyDeleted(event: RemoveFriendshipEvent): void {
    let room: Room = this.mChatClient.getRoomManager().getRoomById(event.getDestination());
    if (typeof room !== "undefined" && room !== null) {
      let roomWindow: RoomWindow = this.mRoomWindowManager.getRoomWindowById(event.getDestination());
      if (typeof roomWindow !== "undefined" && roomWindow !== null) {
        roomWindow.popdown();
      }
    }
  }

  private renameBuddy(buddy: Buddy): void {
    let dialog: RenameBuddyDialog = new RenameBuddyDialog(
      {parent: appCtxt.getShell()},
      this.mChatClient,
      buddy
    );
    dialog.popup();
  }

  private sendInvitation(buddy: Buddy): void {
    this.mChatClient.sendFriendship(
      buddy.getId(),
      buddy.getNickname(),
      buddy.getGroups()[0].getName()
    );
  }

  private acceptInvitation(buddy: Buddy): void {
    AcceptFriendshipDialog.getDialog(
      {parent: appCtxt.getShell()},
      this.mChatClient,
      buddy
    ).popup();
  }

  private changeBuddyGroup(buddy: Buddy, group: Group): void {
    this.mChatClient.changeBuddyGroup(buddy, group);
  }

  private contactDroppedInGroup(contact: ZmContact, group: Group): void {
    this.Log.debug(contact, "Contact dropped in the group " + group.getName());
    let buddyId: string = contact.getEmail(),
      nickname: string = contact.getHeader(),
      chatGroup: string = group.getName(),
      buddyIsCurrentUserOrAlias: boolean = (buddyId === appCtxt.getUsername()),
      buddy: Buddy = this.mChatClient.getBuddyList().getBuddyById(buddyId);
    for (let alias of this.mSettingsManager.get(Setting.MAIL_ALIASES)) {
      if (buddyId === alias) {
        buddyIsCurrentUserOrAlias = true;
      }
    }
    if (typeof buddy !== "undefined" && buddy !== null &&
        buddy.getStatus().getType() !== BuddyStatusType.INVITED) {
      let msgDialog: DwtMessageDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(StringUtils.getMessage("friend_already_added"));
      msgDialog.popup();
    }
    else if (buddyIsCurrentUserOrAlias) {
      let msgDialog: DwtMessageDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(
        StringUtils.getMessage("err_adding_friend"),
        DwtMessageDialog.WARNING_STYLE
      );
      msgDialog.popup();
    }
    else {
      this.mChatClient.sendFriendship(
        buddyId,
        HTMLUtils.htmlEscape(nickname),
        HTMLUtils.htmlEscape(chatGroup)
      );
    }
  }

  private onShowHideOffline(hide: boolean): void {
    this.mSettingsManager.set(Setting.IM_PREF_HIDE_OFFLINE, hide);
  }

  private onChangeSidebarOrDock(onDock: boolean): void {
    this.mSettingsManager.set(Setting.IM_USR_PREF_DOCK, onDock);
  }

  private onGroupExpandedOrCollapsed(item: GroupTreeItem, expand: boolean, save: boolean) {
    if (typeof save !== "undefined" && save !== null && save) {
      this.mStoreGroupsDataCallback.run();
    }
  }

  public onFindMsgObjects(message: ZmMailMsg, manager: ZmObjectManager): void {
    if (typeof this.mObjectHandler !== "undefined" && this.mObjectHandler !== null) {
      this.mObjectHandler.onFindMsgObjects(message, manager);
    }
  }

  private handleNewFriendshipInvitation(buddy: Buddy) {
    let title: string = StringUtils.getMessage("accept_friends_title");
    let message: string = StringUtils.getMessage("accept_friends_text", [buddy.getNickname()]);
    message = message.replace(/<b>/g, "");
    message = message.replace(/<\/b>/g, "");
    message = message.replace(/<br>/g, " ");
    this.displayNotification(title, message, this.getNotificationImage(), true);
    this.displayNotification(title, message, this.getNotificationImage(), false);
  }

  public displayNotification(title: string, message: string, image: string, toast: boolean = false): void {
    this.mNotificationManager.notify(message, title, image, toast);
  }

  public getNotificationImage(): string {
    let differentImage: string = this.mMainWindow.getPluginManager().getFieldPlugin(MainWindow.ChatImageFieldPlugin),
      defaultUrl = this.getResource("images/desktop-chat_128.png");
    if (typeof differentImage !== "undefined" && differentImage !== null) {
      return differentImage;
    }
    return defaultUrl;
  }

  private checkPendingRequest() {
    let stats: GroupStats = this.mChatClient.getBuddyList().getStatistics();
    if (stats.getWaitingForResponseBuddiesCount() > 0) {
      let title: string = StringUtils.getMessage("accept_friends_title"),
        message: string = StringUtils.getMessage("accept_friends_check_text");
      this.displayNotification(title, message, this.getNotificationImage(), true);
    }
  }

  /**
   * Show Dialogs
   */
  protected addBuddy() {
    let contactsEnabled = this.mSettingsManager.get(Setting.CONTACTS_ENABLED),
      galEnabled = this.mSettingsManager.get(Setting.GAL_ENABLED),
      aliases: string[] = [];
    aliases.push(appCtxt.getUsername());
    for (let alias of this.mSettingsManager.get(Setting.MAIL_ALIASES)) {
      aliases.push(alias);
    }
    if (typeof this.mAddBuddyDialog === "undefined" || this.mAddBuddyDialog === null) {
      this.mAddBuddyDialog = new AddBuddyDialog(
        {
          parent: appCtxt.getShell(),
          enableAutoComplete: contactsEnabled || galEnabled,
          dataClass: appCtxt.getAutocompleter()
        },
        this.mChatClient,
        aliases
      );
    }
    this.mAddBuddyDialog.cleanInput();
    this.mAddBuddyDialog.popup();
  }

  protected addGroup() {
    if (typeof this.mAddGroupDialog === "undefined" || this.mAddGroupDialog) {
      this.mAddGroupDialog = new AddGroupDialog(
        { parent: appCtxt.getShell() },
        this.mChatClient,
        appCtxt
      );
    }
    this.mAddGroupDialog.cleanInput();
    this.mAddGroupDialog.popup();
  }

  private renameGroup(group: Group) {
    let dialog: RenameGroupDialog = new RenameGroupDialog(
      { parent: appCtxt.getShell() },
      this.mChatClient,
      appCtxt,
      group
    );
    dialog.popup();
  }

  protected deleteGroup(group: Group) {
    if (group.isEmpty()) {
      if (typeof this.mDeleteGroupDialog === "undefined" || this.mDeleteGroupDialog === null) {
        this.mDeleteGroupDialog = new DwtMessageDialog({
          parent: appCtxt.getShell(),
          buttons: [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON],
          id: IdGenerator.generateId("ZxChat_DeleteGroupDialog")
        });
      }
      this.mDeleteGroupDialog.setMessage(
        StringUtils.getMessage("delete_group_text", [group.getName()]),
        DwtMessageDialog.WARNING_STYLE,
        StringUtils.getMessage("delete_group_title")
      );
      this.mDeleteGroupDialog.setButtonListener(
        DwtDialog.YES_BUTTON,
        new AjxListener(
          this,
          this.deleteGroupDialogYesCallback,
          group
        )
      );
      this.mDeleteGroupDialog.popup();
    }
    else {
      if (typeof this.mWarnDeleteGroupDialog === "undefined" || this.mWarnDeleteGroupDialog === null) {
        this.mWarnDeleteGroupDialog = new DwtMessageDialog({
          parent: appCtxt.getShell(),
          buttons: [DwtDialog.DISMISS_BUTTON],
          id: IdGenerator.generateId("ZxChat_WarnDeleteGroupDialog")
        });
      }
      this.mWarnDeleteGroupDialog.setMessage(
        StringUtils.getMessage("cannot_delete_not_empty_group", [group.getName()]),
        DwtMessageDialog.CRITICAL_STYLE,
        StringUtils.getMessage("delete_group_title")
      );
      this.mWarnDeleteGroupDialog.popup();
    }
  }

  private deleteGroupDialogYesCallback(group: Group, event: DwtSelectionEvent) {
    this.mDeleteGroupDialog.popdown();
    this.mChatClient.getBuddyList().removeGroup(group);
  }

  private showSettings(): void {
    SettingsDialog.getDialog(
      appCtxt,
      appCtxt.getShell(),
      this.getClient(),
      this.mSessionInfoProvider,
      this.mSettingsManager,
      this.mTimedCallbackFactory,
      this.mDateProvider
    ).popup();
  }

}