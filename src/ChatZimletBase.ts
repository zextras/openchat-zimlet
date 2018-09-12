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

import {IMessageUiFactory} from "./app/messageFactory/IMessageUiFactory";
import {BuddyStatus} from "./client/BuddyStatus";
import {BuddyStatusType} from "./client/BuddyStatusType";
import {ChatClient} from "./client/ChatClient";
import {ICommandFactory} from "./client/connection/ICommandFactory";
import {IConnectionManager} from "./client/connection/IConnectionManager";
import {IUserCapabilities} from "./client/connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {EventSessionRegistered} from "./client/events/chat/EventSessionRegistered";
import {RegisterSessionEvent} from "./client/events/chat/RegisterSessionEvent";
import {RemoveFriendshipEvent} from "./client/events/chat/RemoveFriendshipEvent";
import {IChatEvent} from "./client/events/IChatEvent";
import {IEventManager} from "./client/events/IEventManager";
import {IChatEventParser} from "./client/events/parsers/IChatEventParser";
import {Group} from "./client/Group";
import {IBuddy} from "./client/IBuddy";
import {IChatClient} from "./client/IChatClient";
import {ISessionInfoProvider} from "./client/ISessionInfoProvider";
import {AcceptFriendshipDialog} from "./dwt/dialogs/AcceptFriendshipDialog";
import {AddBuddyDialog} from "./dwt/dialogs/AddBuddyDialog";
import {AddGroupDialog} from "./dwt/dialogs/AddGroupDialog";
import {DeleteBuddyDialog} from "./dwt/dialogs/DeleteBuddyDialog";
import {RenameBuddyDialog} from "./dwt/dialogs/RenameBuddyDialog";
import {RenameGroupDialog} from "./dwt/dialogs/RenameGroupDialog";
import {SettingsDialog} from "./dwt/dialogs/SettingsDialog";
import {IdGenerator} from "./dwt/IdGenerator";
import {BuddyTreeItem} from "./dwt/widgets/BuddyTreeItem";
import {GroupTreeItem} from "./dwt/widgets/GroupTreeItem";
import {IRoomWindowFactory} from "./dwt/windows/IRoomWindowFactory";
import {MainWindow} from "./dwt/windows/MainWindow";
import {RoomWindowType} from "./dwt/windows/RoomWindow";
import {RoomWindowManager} from "./dwt/windows/RoomWindowManager";
import {Ii18n} from "./i18n/Ii18n";
import {JQueryPlugins} from "./jquery/JQueryPlugins";
import {LoadingDotsPlugin} from "./jquery/LoadingDotsPlugin";
import {TextCompletePlugin} from "./jquery/TextCompletePlugin";
import {Callback} from "./lib/callbacks/Callback";
import {TimedCallback} from "./lib/callbacks/TimedCallback";
import {TimedCallbackFactory} from "./lib/callbacks/TimedCallbackFactory";
import {ZxError} from "./lib/error/ZxError";
import {ZxErrorCode} from "./lib/error/ZxErrorCode";
import {HTMLUtils} from "./lib/HTMLUtils";
import {IDateProvider} from "./lib/IDateProvider";
import {IdleTimer} from "./lib/IdleTimer";
import {LogEngine} from "./lib/log/LogEngine";
import {Logger} from "./lib/log/Logger";
import {NotificationManager} from "./lib/notifications/NotificationManager";
import {ChatPluginManager} from "./lib/plugin/ChatPluginManager";
import {SidebarUtils} from "./lib/SidebarUtils";
import {StringUtils} from "./lib/StringUtils";
import {Version} from "./lib/Version";
import {ZimbraPatcher} from "./lib/ZimbraPatcher";
import {ZimbraUtils} from "./lib/ZimbraUtils";
import {emojione} from "./libext/emojione";
import {ObjectHandler} from "./objectHandler/ObjectHandler";
import {IUserStatusAction} from "./redux/action/IUserStatusAction";
import {IOpenChatState} from "./redux/IOpenChatState";
import {Setting} from "./settings/Setting";
import {IGroupData, SettingsManager} from "./settings/SettingsManager";
import {AjxException} from "./zimbra/ajax/core/AjxException";
import {DwtEvent} from "./zimbra/ajax/dwt/events/DwtEvent";
import {DwtSelectionEvent} from "./zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtDialog} from "./zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtMessageDialog} from "./zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {AjxListener} from "./zimbra/ajax/events/AjxListener";
import {ZmCsfeException} from "./zimbra/zimbra/csfe/ZmCsfeException";
import {ZmContact} from "./zimbra/zimbraMail/abook/model/ZmContact";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {ZmNewWindow} from "./zimbra/zimbraMail/core/ZmNewWindow";
import {ZmMailMsg} from "./zimbra/zimbraMail/mail/model/ZmMailMsg";
import {ZmObjectManager} from "./zimbra/zimbraMail/share/model/ZmObjectManager";
import {ZmZimletBase} from "./zimbra/zimbraMail/share/model/ZmZimletBase";
import {ZmStatusView} from "./zimbra/zimbraMail/share/view/ZmStatusView";
import {ZimletVersion} from "./ZimletVersion";

export class ChatZimletBase<T extends IOpenChatState> extends ZmZimletBase {

  public static alreadyInit: boolean;
  public static INSTANCE: ChatZimletBase<IOpenChatState>;

  private static RETRY_CONNECT_TIMEOUT: number = 300000;
  private static TIMEOUT_502_DISMISS: number = 300000;
  private static EMOJI_ASSETS_PATH: string = "";

  public pAppName: string;
  protected Log: Logger = LogEngine.getLogger(LogEngine.CHAT);
  protected mDateProvider: IDateProvider;
  protected mSessionInfoProvider: ISessionInfoProvider;
  protected mEventParser: IChatEventParser<IChatEvent>;
  protected mTimedCallbackFactory: TimedCallbackFactory;
  protected mConnectionManager: IConnectionManager;
  protected mSoapCommandFactory: ICommandFactory;
  protected mStore: Store<T>;
  protected mI18n: Store<Ii18n>;
  private mSettingsManager: SettingsManager;
  private mEventManager: IEventManager;
  private mIdleTimer: IdleTimer;
  private mMainWindow: MainWindow;
  private mChatClient: IChatClient;
  private mObjectHandler: ObjectHandler;
  private mPoweredByAlreadyShown: boolean;
  private mUpdateNotified: boolean;
  private mOnline: boolean;
  private mCoreNotFoundNotified: boolean;
  private m502Errors: number;
  private mNotificationManager: NotificationManager;
  private mStoreGroupsDataCallback: Callback;
  private mRoomWindowManager: RoomWindowManager;

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
    const originalConfirmExitMethod: (ev: BeforeUnloadEvent) => void = ZmNewWindow._confirmExitMethod;
    ZmNewWindow._confirmExitMethod =
      (new Callback(this, this.clientShutdownBeforeExit, originalConfirmExitMethod)).toClosure() as () => void;
    window.onbeforeunload = ZmNewWindow._confirmExitMethod;

    this.mJQueryPlugins = new JQueryPlugins(
      new LoadingDotsPlugin(),
      new TextCompletePlugin(),
    );
  }

  public initChatZimlet(
    i18n: Store<Ii18n>,
    timedCallbackFactory: TimedCallbackFactory,
    dateProvider: IDateProvider,
    settingsManager: SettingsManager,
    sessionInfoProvider: ISessionInfoProvider,
    connectionManager: IConnectionManager,
    eventManager: IEventManager,
    chatClientPluginManager: ChatPluginManager,
    mainWindowPluginManager: ChatPluginManager,
    roomWindowManagerPluginManager: ChatPluginManager,
    sidebarUtils: SidebarUtils,
    store: Store<T>,
    roomWindowFactory?: IRoomWindowFactory,
    messageUiFactory?: IMessageUiFactory<IOpenChatState>,
  ): void {

    ZimbraPatcher.patch();
    this.Log.debug("Zimbra patched", "ChatZimletBase");
    this.mJQueryPlugins.installPlugins();
    this.Log.debug("JQuery", "Added plugins");
    this.mI18n = i18n;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mDateProvider = dateProvider;
    this.mSettingsManager = settingsManager;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mConnectionManager = connectionManager;
    this.mEventManager = eventManager;
    this.mStore = store;
    emojione.setSprites(true);
    emojione.setAscii(true);
    emojione.setUnicodeAlt(false);
    emojione.setCacheBustParams("");
    emojione.setImagePath(this.getResource(ChatZimletBase.EMOJI_ASSETS_PATH));

    if (ZimbraUtils.getZimbraMajorVersion() < 7) {
      if (isNaN(ZimbraUtils.getZimbraMajorVersion())) {
        this.displayStatusMessage(
          {
            level: ZmStatusView.LEVEL_CRITICAL,
            msg: StringUtils.getMessage("undetectable_zimbra_version"),
          },
        );
      } else {
        this.displayStatusMessage(
          {
            level: ZmStatusView.LEVEL_CRITICAL,
            msg: StringUtils.getMessage("zimbra_not_supported"),
          },
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
      this.mDateProvider,
      this.mConnectionManager,
      this.mEventManager,
      chatClientPluginManager,
      store,
    );
    this.mChatClient.onRegistrationError(new Callback(this, this.registrationErrorCallback));
    this.mChatClient.onServerOnline(new Callback(this, this.handleServerOnline));
    this.mChatClient.onServerOffline(new Callback(this, this.handleServerOffline));
    this.mChatClient.onProxyError(new Callback(this, this.handle502Error));
    this.mChatClient.onEndProcessResponses(new Callback(this, this.onEndProcessResponses));

    this.mNotificationManager = new NotificationManager(
        StringUtils.getMessage("default_notification_title"),
        location.protocol + "//" + location.hostname + (this.getResource("images/desktop-chat_128.png")),
        this.mTimedCallbackFactory,
        appCtxt,
    );
    this.mNotificationManager.setSoundEnabled(
      this.mSettingsManager.get(Setting.IM_PREF_NOTIFY_SOUNDS),
    );
    this.mNotificationManager.setTitlebarEnabled(
      this.mSettingsManager.get(Setting.IM_PREF_FLASH_BROWSER),
    );
    this.mNotificationManager.setDesktopEnabled(
      this.mSettingsManager.get(Setting.IM_PREF_DESKTOP_ALERT),
    );
    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_NOTIFY_SOUNDS,
      new Callback(this.mNotificationManager, this.mNotificationManager.setSoundEnabled),
    );
    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_FLASH_BROWSER,
      new Callback(this.mNotificationManager, this.mNotificationManager.setTitlebarEnabled),
    );
    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_DESKTOP_ALERT,
      new Callback(this.mNotificationManager, this.mNotificationManager.setDesktopEnabled),
    );
    const userGroupsData: IGroupData[] = this.mSettingsManager.loadGroupsData();
    for (const groupData of userGroupsData) {
      this.mChatClient.getBuddyList().addGroup(new Group(groupData.name));
    }

    this.mMainWindow = new MainWindow(
      appCtxt,
      this.mSettingsManager,
      this.mChatClient.getBuddyList(),
      mainWindowPluginManager,
      this.mStore,
      // sidebarUtils,
    );

    this.mMainWindow.onAddFriendOptionSelected(() => this.addBuddy());
    this.mMainWindow.onAddGroupOptionSelected(() => this.addGroup());
    this.mMainWindow.onSettingsOptionSelected(() => this.showSettings());
    this.mMainWindow.onRenameGroup((group) => this.renameGroup(group));
    this.mMainWindow.onDeleteGroup((group) => this.deleteGroup(group));
    this.mMainWindow.onBuddySelected((ev) => this.buddySelected(ev));
    this.mMainWindow.onDeleteBuddy((buddy) => this.deleteBuddy(buddy));
    this.mMainWindow.onRenameBuddy((buddy) => this.renameBuddy(buddy));
    this.mMainWindow.onSendInvitation((buddy) => this.sendInvitation(buddy));
    this.mMainWindow.onAcceptInvitation((buddy) => this.acceptInvitation(buddy));
    this.mMainWindow.onBuddyDroppedInGroup((buddy, group) => this.changeBuddyGroup(buddy, group));
    this.mMainWindow.onContactDroppedInGroup((contact, group) => this.contactDroppedInGroup(contact, group));
    this.mMainWindow.setShowHideOffline(this.mSettingsManager.get(Setting.IM_PREF_HIDE_OFFLINE));
    this.mMainWindow.setSortMethod(this.mSettingsManager.get(Setting.IM_PREF_BUDDY_SORT));
    this.mMainWindow.onShowHideOffline((hide) => this.onShowHideOffline(hide));

    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_BUDDY_SORT,
      new Callback(this.mMainWindow, this.mMainWindow.sortMethodSet),
    );

    const onDock: boolean = this.mSettingsManager.get(Setting.IM_USR_PREF_DOCK);
    if ((typeof onDock === "undefined" || onDock === null) || onDock) {
      this.mMainWindow.popup();
      this.mMainWindow.changeSidebarOrDock(true);
      const isUp: boolean = this.mSettingsManager.get(Setting.IM_USR_PREF_DOCK_UP);
      if (isUp) {
        this.mMainWindow.setExpanded(false);
      } else {
        this.mMainWindow.setMinimized(false);
      }
    } else {
      this.mMainWindow.changeSidebarOrDock(false);
    }

    this.mMainWindow.onChangeSidebarOrDock((docked) => this.onChangeSidebarOrDock(docked));
    this.mStoreGroupsDataCallback = new Callback(
      this.mSettingsManager,
      this.mSettingsManager.storeGroupsData,
      this.mMainWindow,
    );
    this.mChatClient.getBuddyList().onAddGroup(this.mStoreGroupsDataCallback);
    this.mChatClient.getBuddyList().onRemoveGroup(this.mStoreGroupsDataCallback);
    this.mChatClient.getBuddyList().onRenameGroup(this.mStoreGroupsDataCallback);

    // Set the visibility of loaded groups and show the main window
    this.mMainWindow.setGroupsData(userGroupsData);
    this.mMainWindow.onGroupExpandedOrCollapsed(
      (item, expand, save) => this.onGroupExpandedOrCollapsed(item, expand, save),
    );

    this.mRoomWindowManager = new RoomWindowManager(
      appCtxt,
      appCtxt.getShell(),
      this.mNotificationManager,
      this,
      this.mTimedCallbackFactory,
      this.mMainWindow,
      this.mSessionInfoProvider,
      this.mDateProvider,
      roomWindowManagerPluginManager,
      store,
      roomWindowFactory,
      messageUiFactory,
    );
    this.mChatClient.onMessageReceived(
      (
        roomWindowId: string,
        messageSenderId: string,
        messageContent: string,
      ) => this.mRoomWindowManager.onMessageReceived(
        roomWindowId,
        messageSenderId,
        messageContent,
      ),
    );

    this.mChatClient.onFriendshipInvitation(new Callback(this, this.handleNewFriendshipInvitation));
    this.mObjectHandler = ObjectHandler.getInstance();
    this.registerSettings();
    // Inhibited object handlers, not required anymore
    // ZmObjectManager.registerHandler(
    //   ZimbraUtils.isZimbraVersionLessThan85() ? ObjectHandlerProxy : this.mObjectHandler,
    //   null,
    //   this._zimletContext.priority,
    // );
  }

  public getClient(): IChatClient {
    return this.mChatClient;
  }

  public getMainWindow(): MainWindow {
    return this.mMainWindow;
  }

  public getRoomWindowManager(): RoomWindowManager {
    return this.mRoomWindowManager;
  }

  public onBuddyDeleted(event: RemoveFriendshipEvent): void {
    const roomWindow: RoomWindowType = this.mRoomWindowManager.getRoomWindowById(event.getDestination());
    if (typeof roomWindow !== "undefined" && roomWindow !== null) {
      roomWindow.popdown();
    }
  }

  public displayNotification(title: string, message: string, image: string, toast: boolean = false): void {
    this.mNotificationManager.notify(message, title, image, toast);
  }

  public getNotificationImage(): string {
    const differentImage: string = this.mMainWindow.getPluginManager().getFieldPlugin(MainWindow.ChatImageFieldPlugin);
    const defaultUrl = this.getResource("images/desktop-chat_128.png");
    if (typeof differentImage !== "undefined" && differentImage !== null) {
      return differentImage;
    }
    return defaultUrl;
  }

  public onFindMsgObjects(message: ZmMailMsg, manager: ZmObjectManager): void {
    // if (typeof this.mObjectHandler !== "undefined" && this.mObjectHandler !== null) {
    //   this.mObjectHandler.onFindMsgObjects(message, manager);
    // }
  }

  protected addBuddy() {
    const contactsEnabled = this.mSettingsManager.get(Setting.CONTACTS_ENABLED);
    const galEnabled = this.mSettingsManager.get(Setting.GAL_ENABLED);
    const aliases: string[] = [];
    aliases.push(appCtxt.getUsername());
    for (const alias of this.mSettingsManager.get(Setting.MAIL_ALIASES)) {
      aliases.push(alias);
    }
    if (typeof this.mAddBuddyDialog === "undefined" || this.mAddBuddyDialog === null) {
      this.mAddBuddyDialog = new AddBuddyDialog(
        {
          dataClass: appCtxt.getAutocompleter(),
          enableAutoComplete: contactsEnabled || galEnabled,
          parent: appCtxt.getShell(),
        },
        this.mChatClient,
        aliases,
        this.mStore,
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
        appCtxt,
      );
    }
    this.mAddGroupDialog.cleanInput();
    this.mAddGroupDialog.popup();
  }

  protected deleteGroup(group: Group) {
    if (group.isEmpty()) {
      if (typeof this.mDeleteGroupDialog === "undefined" || this.mDeleteGroupDialog === null) {
        this.mDeleteGroupDialog = new DwtMessageDialog({
          buttons: [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON],
          id: IdGenerator.generateId("ZxChat_DeleteGroupDialog"),
          parent: appCtxt.getShell(),
        });
      }
      this.mDeleteGroupDialog.setMessage(
        StringUtils.getMessage("delete_group_text", [group.getName()]),
        DwtMessageDialog.WARNING_STYLE,
        StringUtils.getMessage("delete_group_title"),
      );
      this.mDeleteGroupDialog.setButtonListener(
        DwtDialog.YES_BUTTON,
        new AjxListener(
          this,
          this.deleteGroupDialogYesCallback,
          group,
        ),
      );
      this.mDeleteGroupDialog.popup();
    } else {
      if (typeof this.mWarnDeleteGroupDialog === "undefined" || this.mWarnDeleteGroupDialog === null) {
        this.mWarnDeleteGroupDialog = new DwtMessageDialog({
          buttons: [DwtDialog.DISMISS_BUTTON],
          id: IdGenerator.generateId("ZxChat_WarnDeleteGroupDialog"),
          parent: appCtxt.getShell(),
        });
      }
      this.mWarnDeleteGroupDialog.setMessage(
        StringUtils.getMessage("cannot_delete_not_empty_group", [group.getName()]),
        DwtMessageDialog.CRITICAL_STYLE,
        StringUtils.getMessage("delete_group_title"),
      );
      this.mWarnDeleteGroupDialog.popup();
    }
  }

  protected handleServerOnline(ev: EventSessionRegistered<IUserCapabilities>): void {
    this.mOnline = true;
    this.mCoreNotFoundNotified = false;
    const requiredVersion: Version = new Version(ev.getInfo<string>("required_zimlet_version"));
    this.mCoreVersion = new Version(ev.getInfo<string>("server_version"));

    if (this.needUpdate(requiredVersion, this.mCoreVersion)) {
      return;
    }

    this.mMainWindow.enableDisableMainMenuButton(true);
    const lastStatusId: string = this.mSettingsManager.get(Setting.IM_USR_PREF_LAST_STATUS);
    for (const userStatus of this.mStore.getState().userStatuses) {
      if (userStatus.type === BuddyStatus.GetTypeFromNumber(parseInt(lastStatusId, 10))) {
        this.mStore.dispatch<IUserStatusAction>({
          status: userStatus,
          type: "SET_USER_STATUS_SE",
        });
      }
    }

    this.mSettingsManager.onSettingChange(
      Setting.IM_PREF_REPORT_IDLE,
      new Callback(this, this.reportIdle),
    );

    // if (this.mSettingsManager.get(Setting.IM_PREF_REPORT_IDLE)) {
    //   this.startIdleTimer();
    // }
    // const checkPendingRequestTimedCallback: TimedCallback = new TimedCallback(
    //   new Callback(this, this.checkPendingRequest),
    //   500,
    // );
    // checkPendingRequestTimedCallback.start();
  }

  private clientShutdownBeforeExit(originalConfirmExitMethod: (ev?: DwtEvent) => void, event: DwtEvent): void {
    if (typeof this.mChatClient !== "undefined" && this.mChatClient !== null) {
      this.mChatClient.shutdown();
    }
    originalConfirmExitMethod(event);
  }

  private needUpdate(
    requiredZimletVersion: Version,
    coreVersionDeclared: Version,
  ): boolean {
    let needUpdate = false;
    if (ZimletVersion.getVersion().lessThan(requiredZimletVersion)) {
      const updateMessage: DwtMessageDialog = new DwtMessageDialog(
        {
          buttons: [DwtDialog.DISMISS_BUTTON],
          id: IdGenerator.generateId("ZxChat_UpgradeZimletMessageDialog"),
          parent: appCtxt.getShell(),
        },
      );
      updateMessage.setMessage(
        StringUtils.getMessage("need_update_zimlet", [ZimletVersion.ZIMLET_NAME]) +
        "<br/>Current <b>Chat Zimlet</b> version: " +
        ZimletVersion.getVersion().toString() +
        "<br/> Needed <b>Chat Zimlet</b> version: " +
        requiredZimletVersion,
      );
      updateMessage.popup();
      needUpdate = true;
    }
    if (coreVersionDeclared.lessThan(this.mRequiredCoreVersion) && !needUpdate) {
      const updateMessage: DwtMessageDialog = new DwtMessageDialog({
        buttons: [DwtDialog.DISMISS_BUTTON],
        id: IdGenerator.generateId("ZxChat_UpgradeCoreMessageDialog"),
        parent: appCtxt.getShell(),
      });
      updateMessage.setMessage(
        StringUtils.getMessage("need_update_core", [ZimletVersion.ZIMLET_NAME]) +
        "<br/>Current <b>Chat Server</b> version: " +
        coreVersionDeclared +
        "<br/> Needed <b>Chat Server</b> version: " +
        this.mRequiredCoreVersion,
      );
      updateMessage.popup();
      needUpdate = true;
    }
    return needUpdate;
  }

  private reportIdle(reportIdle: boolean) {
    if (reportIdle) {
      this.startIdleTimer();
    } else {
      this.stopIdleTimer();
    }
  }

  private handleServerOffline(err: ZxError) {
    this.mOnline = false;
    if (err.hasOwnProperty("isZxError")
      && err.getCode() === ZxErrorCode.NO_SUCH_CHAT_SESSION) {
      this.mConnectionManager.sendEvent(
        new RegisterSessionEvent(
          ZimletVersion.getVersion(),
          this.mDateProvider.getNow(),
        ),
        new Callback(this, this._onRegisterSession),
        new Callback(this, this.handleServerOffline),
      );
    } else {
      (new TimedCallback(
        new Callback(
          this,
          this.displayStatusMessage,
          {
            level: ZmStatusView.LEVEL_CRITICAL,
            msg: StringUtils.getMessage("error_contact_server"),
          },
        ),
        1000,
      )).start();
    }
  }

  private _onRegisterSession(ev: EventSessionRegistered<IUserCapabilities>): void {
    this.mEventManager.handleEvent(ev, this.mChatClient);
  }

  private handle502Error(error: ZxError) {
    this.m502Errors += 1;
    this.Log.err(error, "Proxy Error found");
    if (this.m502Errors === 3) {
      const msgDialog: DwtMessageDialog = new DwtMessageDialog({
        buttons: [DwtDialog.DISMISS_BUTTON],
        parent: appCtxt.getShell(),
      });
      msgDialog.setMessage(
        StringUtils.getMessage("error_502_message", [error.getDetail("detail").toString()]),
        DwtMessageDialog.WARNING_STYLE,
        StringUtils.getMessage("error_502_title"),
      );
      msgDialog.popup();
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(msgDialog, msgDialog.popdown),
        ChatZimletBase.TIMEOUT_502_DISMISS,
      ).start();
    }
  }

  private registrationErrorCallback(error: ZxError): boolean {
    let msg: string;
    if (
      typeof error !== "undefined"
      && error !== null
      && typeof error.getCause !== "undefined"
      && typeof error.getCause() !== "undefined"
      && error.getCause() !== null
      && typeof error.getCause().getCode !== "undefined"
      && error.getCause().getCode !== null
      && error.getCause().getCode() === ZxErrorCode.DELEGATED_OR_RESOURCES_NOT_ALLOWED_TO_CHAT
    ) {
      this.mSettingsManager.DELEGATED_ACCESS = true;
      msg = StringUtils.getMessage("delegated_or_resources_not_allowed");
      this.mMainWindow.setMinimized();
      this.mMainWindow.setEnabled(false);
      this.mMainWindow.changeSidebarOrDock(true);
      this.mMainWindow.enableDisableMainMenuButton(false);
    } else {
      msg = StringUtils.getMessage("zxchat_core_missing_body");
    }
    if (!this.mCoreNotFoundNotified) {
      this.mCoreNotFoundNotified = true;
      this.displayStatusMessage(
        {
          level: ZmStatusView.LEVEL_WARNING,
          msg: msg,
        },
      );
    }
    if (this.registrationShouldRetry(error)) {
      this.Log.warn(
        "Trying in " + (ChatZimletBase.RETRY_CONNECT_TIMEOUT / 1000) + "s",
        "Register session error",
      );
      // this.mTimedCallbackFactory.createTimedCallback(
      //   new Callback(this.mChatClient, this.mChatClient.registerSession),
      //   ChatZimletBase.RETRY_CONNECT_TIMEOUT,
      // ).start();
    } else {
      if (this.mSettingsManager.DELEGATED_ACCESS) {
        this.Log.warn(
          error,
          "Register session error",
        );
      } else {
        this.Log.warn(
          error,
          "Register session error",
        );
      }
    }
    return true;
  }

  private registrationShouldRetry(error: ZxError): boolean {
    const digested: ZxError = ZxError.convertError(error);
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

  private handleIdle(idleStatus: boolean): void {
  }

  private startIdleTimer() {
    try {
      if (typeof this.mIdleTimer === "undefined" || this.mIdleTimer === null) {
        this.mIdleTimer = new IdleTimer (
          this.mSettingsManager.get(Setting.IM_PREF_IDLE_TIMEOUT) * 60000,
          new Callback(this, this.handleIdle),
        );
        this.mSettingsManager.onSettingChange(
          Setting.IM_PREF_IDLE_TIMEOUT,
          new Callback(this, this.setIdleTime),
        );
      } else {
        this.setIdleTime(
          this.mSettingsManager.get(Setting.IM_PREF_IDLE_TIMEOUT),
        );
        this.mIdleTimer.start();
      }
    } catch (error) {
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

  private buddySelected(event: DwtSelectionEvent): void {
    const buddyTreeItemSelected: BuddyTreeItem = event.dwtObj as BuddyTreeItem;
    const buddyId: string = buddyTreeItemSelected.getId();
    const buddy: IBuddy = this.mChatClient.getBuddyList().getBuddyById(buddyId);
    if (typeof buddy !== "undefined" && buddy.getStatus().getType() === BuddyStatusType.INVITED) {
      if (typeof buddyTreeItemSelected.onAction !== "undefined" && buddyTreeItemSelected.onAction === null) {
        buddyTreeItemSelected.onAction(event);
      }
    } else if (typeof buddy !== "undefined" && buddy.getStatus().getType() === BuddyStatusType.NEED_RESPONSE) {
      this.acceptInvitation(buddy);
    } else {
      const roomWindow: RoomWindowType = this.mRoomWindowManager.getRoomWindowById(buddyId);
      roomWindow.popup(undefined, true);
      roomWindow.inputfieldFocus();
    }
  }

  private deleteBuddy(buddy: IBuddy): void {
    const dialog: DeleteBuddyDialog = DeleteBuddyDialog.getDialog(
      appCtxt.getShell(),
      (ev: RemoveFriendshipEvent) => this.onBuddyDeleted(ev),
      this.mStore,
    );
    dialog.setBuddy(buddy);
    dialog.popup();
  }

  private renameBuddy(buddy: IBuddy): void {
    const dialog: RenameBuddyDialog = new RenameBuddyDialog(
      {parent: appCtxt.getShell()},
      this.mChatClient,
      buddy,
    );
    dialog.popup();
  }

  private sendInvitation(buddy: IBuddy): void {
    this.mChatClient.sendFriendship(
      buddy.getId(),
      buddy.getNickname(),
      buddy.getGroups()[0].getName(),
    );
  }

  private acceptInvitation(buddy: IBuddy): void {
    AcceptFriendshipDialog.getDialog(
      {parent: appCtxt.getShell()},
      this.mChatClient,
      buddy,
    ).popup();
  }

  private changeBuddyGroup(buddy: IBuddy, group: Group): void {
    this.mChatClient.changeBuddyGroup(buddy, group);
  }

  private contactDroppedInGroup(contact: ZmContact, group: Group): void {
    this.Log.debug(contact, "Contact dropped in the group " + group.getName());
    const buddyId: string = contact.getEmail();
    const nickname: string = contact.getHeader();
    const chatGroup: string = group.getName();
    let buddyIsCurrentUserOrAlias: boolean = (buddyId === appCtxt.getUsername());
    const buddy: IBuddy = this.mChatClient.getBuddyList().getBuddyById(buddyId);
    for (const alias of this.mSettingsManager.get(Setting.MAIL_ALIASES)) {
      if (buddyId === alias) {
        buddyIsCurrentUserOrAlias = true;
      }
    }
    if (
      typeof buddy !== "undefined"
      && buddy !== null
      && buddy.getStatus().getType() !== BuddyStatusType.INVITED
    ) {
      const msgDialog: DwtMessageDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(StringUtils.getMessage("friend_already_added"));
      msgDialog.popup();
    } else if (buddyIsCurrentUserOrAlias) {
      const msgDialog: DwtMessageDialog = appCtxt.getMsgDialog();
      msgDialog.setMessage(
        StringUtils.getMessage("err_adding_friend"),
        DwtMessageDialog.WARNING_STYLE,
      );
      msgDialog.popup();
    } else {
      this.mChatClient.sendFriendship(
        buddyId,
        HTMLUtils.htmlEscape(nickname),
        HTMLUtils.htmlEscape(chatGroup),
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

  private handleNewFriendshipInvitation(buddy: IBuddy) {
    const title: string = StringUtils.getMessage("accept_friends_title");
    let message: string = StringUtils.getMessage("accept_friends_text", [buddy.getNickname()]);
    message = message.replace(/<b>/g, "");
    message = message.replace(/<\/b>/g, "");
    message = message.replace(/<br>/g, " ");
    this.displayNotification(title, message, this.getNotificationImage(), true);
    this.displayNotification(title, message, this.getNotificationImage(), false);
  }

  // private checkPendingRequest() {
  //   const stats: GroupStats = this.mChatClient.getBuddyList().getStatistics();
  //   if (stats.getWaitingForResponseBuddiesCount() > 0) {
  //     const title: string = StringUtils.getMessage("accept_friends_title");
  //     const message: string = StringUtils.getMessage("accept_friends_check_text");
  //     this.displayNotification(title, message, this.getNotificationImage(), true);
  //   }
  // }

  private renameGroup(group: Group) {
    const dialog: RenameGroupDialog = new RenameGroupDialog(
      { parent: appCtxt.getShell() },
      this.mChatClient,
      appCtxt,
      group,
    );
    dialog.popup();
  }

  private deleteGroupDialogYesCallback(group: Group, event: DwtSelectionEvent) {
    this.mDeleteGroupDialog.popdown();
    this.mChatClient.getBuddyList().removeGroup(group);
  }

  private showSettings(): void {
    SettingsDialog.getDialog(
      appCtxt,
      appCtxt.getShell(),
      this.mChatClient,
      this.mConnectionManager,
      this.mSettingsManager,
      this.mTimedCallbackFactory,
      this.mDateProvider,
      this.mStore,
    ).popup();
  }

  private registerSettings(): void {
    this.mObjectHandler.setEmojiEnabledInConv(this.mSettingsManager.enabledEmojiInChatConversation());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_EMOJI_IN_CONV,
      new Callback(this.mObjectHandler, this.mObjectHandler.setEmojiEnabledInConv),
    );
    this.mObjectHandler.setEmojiEnabledInHist(this.mSettingsManager.enabledEmojiInChatHistory());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_EMOJI_IN_HIST,
      new Callback(this.mObjectHandler, this.mObjectHandler.setEmojiEnabledInHist),
    );
    this.mObjectHandler.setEmojiEnabledInMail(this.mSettingsManager.enabledEmojiInMail());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_EMOJI_IN_MAIL,
      new Callback(this.mObjectHandler, this.mObjectHandler.setEmojiEnabledInMail),
    );

    this.mObjectHandler.setUrlEnabledInConv(this.mSettingsManager.enabledUrlInChatConversation());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_URL_IN_CONV,
      new Callback(this.mObjectHandler, this.mObjectHandler.setUrlEnabledInConv),
    );
    this.mObjectHandler.setUrlEnabledInHist(this.mSettingsManager.enabledUrlInChatHistory());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_URL_IN_HIST,
      new Callback(this.mObjectHandler, this.mObjectHandler.setUrlEnabledInHist),
    );
    this.mObjectHandler.setUrlEnabledInMail(this.mSettingsManager.enabledUrlInMail());
    this.mSettingsManager.onSettingChange(
      Setting.IM_USR_PREF_URL_IN_MAIL,
      new Callback(this.mObjectHandler, this.mObjectHandler.setUrlEnabledInMail),
    );
  }
}
