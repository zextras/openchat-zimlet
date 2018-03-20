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

import {IConnectionManager} from "../../client/connection/IConnectionManager";
import {IChatClient} from "../../client/IChatClient";
import {Callback} from "../../lib/callbacks/Callback";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {IDateProvider} from "../../lib/IDateProvider";
import {LogEngine} from "../../lib/log/LogEngine";
import {Logger} from "../../lib/log/Logger";
import {StringUtils} from "../../lib/StringUtils";
import {Version} from "../../lib/Version";
import {Bowser} from "../../libext/bowser";
import {IResetSessionInfoAction} from "../../redux/action/IResetSessionInfoAction";
import {IOpenChatSessionInfo, IOpenChatState} from "../../redux/IOpenChatState";
import {Setting} from "../../settings/Setting";
import {SettingsManager} from "../../settings/SettingsManager";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtButton} from "../../zimbra/ajax/dwt/widgets/DwtButton";
import {DwtCheckbox} from "../../zimbra/ajax/dwt/widgets/DwtCheckbox";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {DwtGrouper} from "../../zimbra/ajax/dwt/widgets/DwtGrouper";
import {DwtInputField} from "../../zimbra/ajax/dwt/widgets/DwtInputField";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {DwtSelect, DwtSelectOption} from "../../zimbra/ajax/dwt/widgets/DwtSelect";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {DwtTabButton, DwtTabView, DwtTabViewPage} from "../../zimbra/ajax/dwt/widgets/DwtTabView";
import {DwtToolBar} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmApp} from "../../zimbra/zimbraMail/core/ZmApp";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ZmOperation} from "../../zimbra/zimbraMail/core/ZmOperation";
import {ZmComposeController} from "../../zimbra/zimbraMail/mail/controller/ZmComposeController";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";
import {IdGenerator} from "../IdGenerator";

export class SettingsDialog extends DwtDialog {

  public static getDialog(
    appCtxt: ZmAppCtxt,
    shell: DwtShell,
    client: IChatClient,
    connectionManager: IConnectionManager,
    preferenceManager: SettingsManager,
    timedCallbackFactory: TimedCallbackFactory,
    dateProvider: IDateProvider,
    store: Store<IOpenChatState>,
  ): SettingsDialog {
    if (typeof SettingsDialog.dialog === "undefined" || SettingsDialog.dialog === null) {
      SettingsDialog.dialog = new SettingsDialog(
        appCtxt,
        shell,
        client,
        connectionManager,
        preferenceManager,
        timedCallbackFactory,
        dateProvider,
        store,
      );
    }
    SettingsDialog.dialog.hideDebugTab();
    SettingsDialog.dialog.getDebugInfoCheckbox().setSelected(false);
    SettingsDialog.dialog.getErrorTextArea().setValue(ZmMsg.loading);
    return SettingsDialog.dialog;
  }

  private static width: number = 480;
  private static height: number = 327;
  private static PREF_TAB: string = "pref_tab";
  private static CONTENTS_TAB: string = "contents_tab";
  private static INFO_TAB: string = "info_tab";
  private static DEBUG_TAB: string = "debug_tab";

  private static dialog: SettingsDialog = null;

  private mLog: Logger = LogEngine.getLogger(LogEngine.CHAT);
  private mAppCtxt: ZmAppCtxt;
  private mClient: IChatClient;
  private mConnectionManager: IConnectionManager;
  private mPreferenceManager: SettingsManager;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mDateProvider: IDateProvider;
  private mSettingsObjs: { [key: string]: DwtControl };
  private mOriginals: { [key: string]: string | boolean };
  private mTabIds: { [tab: string]: number };
  private mOnPopDownSwitchToFirstTabCallback: Callback;
  private mDebugTabButton: DwtTabButton;
  private mDebugInfoCheckbox: DwtCheckbox;
  private mErrorTextArea: DwtInputField;
  private mDebugTab: DwtTabViewPage;
  private mResetButton: DwtButton;
  private mStore: Store<IOpenChatState>;

  constructor(
    appCtxt: ZmAppCtxt,
    shell: DwtShell,
    client: IChatClient,
    connectionManager: IConnectionManager,
    preferenceManager: SettingsManager,
    timedCallbackFactory: TimedCallbackFactory,
    dateProvider: IDateProvider,
    store: Store<IOpenChatState>,
  ) {
    super({
      parent: shell,
      title: StringUtils.getMessage("title_chat_preferences"),
    });
    this.mAppCtxt = appCtxt;
    this.mClient = client;
    this.mConnectionManager = connectionManager;
    this.mPreferenceManager = preferenceManager;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mDateProvider = dateProvider;
    this.mStore = store;
    this.mSettingsObjs = {};
    this.mOriginals = {};
    this.mTabIds = {};
    this.loadOriginalValues();
    this.setButtonListener(
      DwtDialog.OK_BUTTON,
      new AjxListener(this, this.okBtnListener),
    );
    this.addListener(
      DwtEvent.ENTER,
      new AjxListener(this, this.okBtnListener),
    );
    const view: DwtComposite = new DwtComposite(this);
    view.setSize(
      SettingsDialog.width,
      SettingsDialog.height,
    );
    const tabView: DwtTabView = new DwtTabView(view);
    tabView.setSize(
      SettingsDialog.width,
      Dwt.DEFAULT,
    );
    this.mOnPopDownSwitchToFirstTabCallback = new Callback(tabView, tabView.switchToTab, "1");
    if (typeof ZmApp.ENABLED_APPS[ZmApp.PREFERENCES] !== "undefined" && ZmApp.ENABLED_APPS[ZmApp.PREFERENCES]) {
      this.addPreferencesTab(tabView);
      // Inhibited emoji and url settings not considered anymore.
      // this.addContentDisplaySettingsTab(tabView);
    }
    this.addInfoTab(tabView);
    this.addDebugTab(tabView);
    this.mDebugTabButton = tabView.getTabButton(this.mTabIds[SettingsDialog.DEBUG_TAB]);
    this.hideDebugTab();
    this.setView(view);
  }

  public getTabKeys(): string[] {
    const toReturn: string[] = [];
    for (const name in this.mTabIds) {
      if (!this.mTabIds.hasOwnProperty(name)) { continue; }
      toReturn.push(name);
    }
    return toReturn;
  }

  public getDebugInfoCheckbox(): DwtCheckbox {
    return this.mDebugInfoCheckbox;
  }

  public getErrorTextArea(): DwtInputField {
    return this.mErrorTextArea;
  }

  public popdown(): void {
    super.popdown();
    this.mOnPopDownSwitchToFirstTabCallback.run();
  }
  private loadOriginalValues(): void {
    const valuesToLoad: string[] = [
      Setting.IM_USR_PREF_EMOJI_IN_CONV,
      Setting.IM_USR_PREF_EMOJI_IN_HIST,
      Setting.IM_USR_PREF_EMOJI_IN_MAIL,
      Setting.IM_USR_PREF_URL_IN_CONV,
      Setting.IM_USR_PREF_URL_IN_HIST,
      Setting.IM_USR_PREF_URL_IN_MAIL,
      Setting.IM_PREF_BUDDY_SORT,
      Setting.IM_PREF_NOTIFY_SOUNDS,
      Setting.IM_PREF_FLASH_BROWSER,
      Setting.IM_PREF_DESKTOP_ALERT,
      Setting.IM_PREF_REPORT_IDLE,
      Setting.IM_PREF_IDLE_TIMEOUT,
    ];
    for (const key of valuesToLoad) {
      this.mOriginals[key] = this.mPreferenceManager.get(key);
    }
  }

  private okBtnListener(): void {
    this.setValues(this.getSettingsModifications());
    this.loadOriginalValues();
    this.popdown();
  }

  private setValues(modifications: { [key: string]: string | boolean }): void {
    for (const key in modifications) {
      if (!modifications.hasOwnProperty(key)) { continue; }
      this.mPreferenceManager.set(key, modifications[key]);
    }
  }

  private getSettingsModifications(): { [key: string]: string | boolean } {
    const checkboxes: string[] = [
      Setting.IM_USR_PREF_EMOJI_IN_CONV,
      Setting.IM_USR_PREF_EMOJI_IN_HIST,
      Setting.IM_USR_PREF_EMOJI_IN_MAIL,
      Setting.IM_USR_PREF_URL_IN_CONV,
      Setting.IM_USR_PREF_URL_IN_HIST,
      Setting.IM_USR_PREF_URL_IN_MAIL,
      Setting.IM_PREF_NOTIFY_SOUNDS,
      Setting.IM_PREF_FLASH_BROWSER,
      Setting.IM_PREF_DESKTOP_ALERT,
      Setting.IM_PREF_REPORT_IDLE,
    ];
    const mods: { [key: string]: string | boolean } = {};
    for (const key in this.mOriginals) {
      if (!this.mOriginals.hasOwnProperty(key) || typeof this.mSettingsObjs[key] === "undefined") { continue; }
      let isCheckBox: boolean = false;
      for (const checkBoxId of checkboxes) {
        if (key === checkBoxId) {
          if (this.mOriginals[key] !== (this.mSettingsObjs[key] as DwtCheckbox).isSelected()) {
            mods[key] = (this.mSettingsObjs[key] as DwtCheckbox).isSelected();
          }
          isCheckBox = true;
          break;
        }
      }
      if (!isCheckBox) {
        if (this.mOriginals[key] !== (this.mSettingsObjs[key] as DwtSelect).getValue()) {
          mods[key] = (this.mSettingsObjs[key] as DwtSelect).getValue();
        }
      }
    }
    return mods;
  }

  private addPreferencesTab(group: DwtTabView): void {
    const prefTab: DwtTabViewPage = new DwtTabViewPage(group);
    // const idleGroup: DwtGrouper = new DwtGrouper(prefTab);
    // idleGroup.setLabel(StringUtils.getMessage("pref_title_idle"));
    // const idleCtrl: DwtComposite = new DwtComposite({parent: idleGroup});
    // const enableIdleDetection = new DwtCheckbox({
    //     checked: this.mOriginals[Setting.IM_PREF_REPORT_IDLE] as boolean,
    //     name: Setting.IM_PREF_REPORT_IDLE,
    //     parent: idleCtrl,
    //   });
    // enableIdleDetection.setText(StringUtils.getMessage("pref_title_idle_enabled"));
    // const idleTimeoutLabel: DwtLabel = new DwtLabel({parent: idleCtrl});
    // idleTimeoutLabel.setText(`${StringUtils.getMessage("pref_title_idle_timeout")}:`);
    // const idleOptions: DwtSelectOption[] = [];
    // for (const minutes of ["1", "5", "10", "20", "30", "60"]) {
    //   const minutesText: string = minutes === "1" ? ZmMsg.minute : ZmMsg.minutes;
    //   idleOptions.push(new DwtSelectOption(
    //     minutes,
    //       this.mOriginals[Setting.IM_PREF_IDLE_TIMEOUT] === minutes,
    //     `${minutes} ${minutesText}`,
    //     ),
    //   );
    // }
    // this.mSettingsObjs[Setting.IM_PREF_REPORT_IDLE] = enableIdleDetection;
    // this.mSettingsObjs[Setting.IM_PREF_IDLE_TIMEOUT] = new DwtSelect({
    //   id: IdGenerator.generateId("ZxChat_ChatSettingsSelectTimeout"),
    //   // name: Setting.IM_PREF_IDLE_TIMEOUT,
    //   options: idleOptions,
    //   parent: idleCtrl,
    // });
    // idleGroup.setView(idleCtrl);

    const contactGroup: DwtGrouper = new DwtGrouper(prefTab);
    contactGroup.setLabel(StringUtils.getMessage("buddy_list"));
    const contactCtrl: DwtComposite = new DwtComposite({parent: contactGroup});
    const orderLabel: DwtLabel = new DwtLabel({parent: contactCtrl});
    orderLabel.setText(`${StringUtils.getMessage("pref_title_display_order")}:`);
    this.mSettingsObjs[Setting.IM_PREF_BUDDY_SORT] = new DwtSelect({
      id: IdGenerator.generateId("ZxChat_ChatSettingsSelectSort"),
      // name: Setting.IM_PREF_BUDDY_SORT,
      options: [
        new DwtSelectOption(
          Setting.BUDDY_SORT_NAME,
          this.mOriginals[Setting.IM_PREF_BUDDY_SORT] === Setting.BUDDY_SORT_NAME,
          StringUtils.getMessage("add_friends_username"),
        ),
        new DwtSelectOption(
          Setting.BUDDY_SORT_PRESENCE,
          this.mOriginals[Setting.IM_PREF_BUDDY_SORT] === Setting.BUDDY_SORT_PRESENCE,
          StringUtils.getMessage("presence"),
        ),
      ],
      parent: contactCtrl,
    });
    contactGroup.setView(contactCtrl);

    const notificationsGroup: DwtGrouper = new DwtGrouper(prefTab);
    notificationsGroup.setLabel(StringUtils.getMessage("pref_title_notifications"));
    const notificationsCtrl: DwtComposite = new DwtComposite({parent: notificationsGroup});
    const playSound = new DwtCheckbox({
        checked: this.mOriginals[Setting.IM_PREF_NOTIFY_SOUNDS] as boolean,
        name: Setting.IM_PREF_NOTIFY_SOUNDS,
        parent: notificationsCtrl,
      });
    playSound.setText(StringUtils.getMessage("pref_title_play_sound"));
    this.mSettingsObjs[Setting.IM_PREF_NOTIFY_SOUNDS] = playSound;
    const notifyOnBrowserTitle: DwtCheckbox = new DwtCheckbox({
      checked: this.mOriginals[Setting.IM_PREF_FLASH_BROWSER] as boolean,
      name: Setting.IM_PREF_FLASH_BROWSER,
      parent: notificationsCtrl,
    });
    notifyOnBrowserTitle.setText(StringUtils.getMessage("pref_title_flash_browser_title"));
    this.mSettingsObjs[Setting.IM_PREF_FLASH_BROWSER] = notifyOnBrowserTitle;
    const desktopAlert: DwtCheckbox = new DwtCheckbox({
      checked: this.mOriginals[Setting.IM_PREF_DESKTOP_ALERT] as boolean,
      name: Setting.IM_PREF_DESKTOP_ALERT,
      parent: notificationsCtrl,
    });
    desktopAlert.setText(StringUtils.getMessage("pref_title_desktop_notification_chrome"));
    this.mSettingsObjs[Setting.IM_PREF_DESKTOP_ALERT] = desktopAlert;
    // # TODO: Add here the link to popup the desktop notifications
    notificationsGroup.setView(notificationsCtrl);

    this.mTabIds[SettingsDialog.PREF_TAB] = group.addTab(
      ZmMsg.preferences,
      prefTab,
      `${this.getHTMLElId()}_pref_tab`,
    );
  }

  private addContentDisplaySettingsTab(group: DwtTabView): void {
    const contentTab: DwtTabViewPage = new DwtTabViewPage(group);

    const displayEmojiOptsGroup: DwtGrouper = new DwtGrouper(contentTab);
    displayEmojiOptsGroup.setLabel(StringUtils.getMessage("label_emoji_display_options"));
    const displayOptsCtrl: DwtComposite = new DwtComposite({parent: displayEmojiOptsGroup});
    this.addCheckboxInContentTab(
      Setting.IM_USR_PREF_EMOJI_IN_CONV,
      displayOptsCtrl,
      StringUtils.getMessage("label_enable_emoji_in_chat"),
    );
    this.addCheckboxInContentTab(
      Setting.IM_USR_PREF_EMOJI_IN_HIST,
      displayOptsCtrl,
      StringUtils.getMessage("label_enable_emoji_in_chat_history"),
    );
    this.addCheckboxInContentTab(
      Setting.IM_USR_PREF_EMOJI_IN_MAIL,
      displayOptsCtrl,
      StringUtils.getMessage("label_enable_emoji_in_mail"),
    );
    displayEmojiOptsGroup.setView(displayOptsCtrl);

    const displayUrlOptsGroup: DwtGrouper = new DwtGrouper(contentTab);
    displayUrlOptsGroup.setLabel(StringUtils.getMessage("label_url_display_options"));
    const displayUrlOptsCtrl: DwtComposite = new DwtComposite({parent: displayUrlOptsGroup});
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_URL_IN_CONV,
      displayUrlOptsCtrl,
      StringUtils.getMessage("label_enable_url_in_chat"),
    );
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_URL_IN_HIST,
      displayUrlOptsCtrl,
      StringUtils.getMessage("label_enable_url_in_chat_history"),
    );
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_URL_IN_MAIL,
      displayUrlOptsCtrl,
      StringUtils.getMessage("label_enable_url_in_mail"),
    );
    displayUrlOptsGroup.setView(displayUrlOptsCtrl);

    this.mTabIds[SettingsDialog.CONTENTS_TAB] = group.addTab(
      StringUtils.getMessage("title_contents"),
      contentTab,
      `${this.getHTMLElId()}_contents_tab`,
    );
  }

  private addCheckboxInContentTab(setting: string, parent: DwtComposite, message: string): void {
    const checkbox: DwtCheckbox = new DwtCheckbox({
      checked: this.mOriginals[setting] as boolean,
      name: setting,
      parent: parent,
    });
    checkbox.setText(message);
    this.mSettingsObjs[setting] = checkbox;
  }

  private addInfoTab(group: DwtTabView): void {
    const infoTab: DwtTabViewPage = new DwtTabViewPage(group);
    const copyrightGroup: DwtGrouper = new DwtGrouper(infoTab);
    copyrightGroup.setLabel("Copyright");
    const copyrightCtrl: DwtComposite = new DwtComposite({parent: copyrightGroup});
    const copyrightLabel: DwtLabel = new DwtLabel({parent: copyrightCtrl});
    copyrightLabel.setText("Zextras");
    copyrightGroup.setView(copyrightCtrl);

    const versionGroup: DwtGrouper = new DwtGrouper(infoTab);
    versionGroup.setLabel(`${StringUtils.getMessage("current_zimlet_version")}`);
    const versionCtrl: DwtComposite = new DwtComposite({parent: versionGroup});
    let testingMessage: string = "";
    if (this.mPreferenceManager.isZimletTesting()) {
      testingMessage = " <span style=\"color: #FF0000; font-weight:700;\">TESTING</span>";
    }
    const versionMsg: string =
      `${this.mPreferenceManager.getZimletVersion().toString()}${testingMessage}
      <a href=\"https://github.com/ZeXtras/openchat-zimlet/tree/${this.mPreferenceManager.getZimletCommitId()}\"
       target=\"_blank\">
        @${this.mPreferenceManager.getZimletCommitId()}
      </a>`;
    const versionLabel: DwtLabel = new DwtLabel({parent: versionCtrl});
    versionLabel.setText(versionMsg);
//    if @preferenceManager.getZimletVersion().lessThan(@preferenceManager.getZimletAvailableVersion())
//      updateStatus = new DwtLabel({parent: versionCtrl})
//      updateStatus.setText(
//        """
//        <b>#{StringUtils.getMessage("available_zimlet_version")}:</b>
//          #{@preferenceManager.getZimletAvailableVersion().toString()}
//        """
//      )
    versionGroup.setView(versionCtrl);

    const creditGroup: DwtGrouper = new DwtGrouper(infoTab);
    creditGroup.setLabel(StringUtils.getMessage("label_credits"));
    const creditCtrl: DwtComposite = new DwtComposite({parent: creditGroup});
    const translationCredits = new DwtLabel({parent: creditCtrl});
    translationCredits.setText(
      `${StringUtils.getMessage("pref_help_translate")} -
        <a href='http://wiki.zextras.com/wiki/I18n_-_Internationalization_and_Localization'
         target=_blank>Community Translation Team</a>`,
    );
    const emojiDisclaimer: DwtLabel = new DwtLabel({parent: creditCtrl});
    emojiDisclaimer.setText(
      `Emoji provided free by <a href="http://emojione.com" target="_blank">Emoji One</a>`,
    );
    creditGroup.setView(creditCtrl);

    const debugGroup: DwtGrouper = new DwtGrouper(infoTab);
    debugGroup.setLabel(StringUtils.getMessage("label_debug"));
    const debugCtrl: DwtComposite = new DwtComposite({parent: debugGroup});
    this.mDebugInfoCheckbox = new DwtCheckbox({
      checked: false,
      name: SettingsDialog.DEBUG_TAB,
      parent: debugCtrl,
    });
    this.mDebugInfoCheckbox.setText(StringUtils.getMessage("enable_debug_info"));
    this.mDebugInfoCheckbox.addSelectionListener(new AjxListener(this, this.selectionListener));
    debugGroup.setView(debugCtrl);
    this.mTabIds[SettingsDialog.INFO_TAB] = group.addTab(
      StringUtils.getMessage("pref_title_about"),
      infoTab,
      `${this.getHTMLElId()}_about_tab`,
    );
  }

  private selectionListener(ev: DwtSelectionEvent): void {
    const setErrorText: () => void = () => this.mErrorTextArea.setValue(this.mLog.exportLog());
    if (this.mDebugInfoCheckbox.isSelected()) {
      this.showDebugTab();
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(this, setErrorText),
        10,
      ).start();
    } else {
      this.hideDebugTab();
    }
  }

  private addDebugTab(group: DwtTabView): void {
    if (typeof this.mDebugTab !== "undefined" && this.mDebugTab !== null) {
      return;
    }
    this.mDebugTab = new DwtTabViewPage(group);
    const debugLogGroup: DwtGrouper = new DwtGrouper(this.mDebugTab);
    debugLogGroup.setLabel(StringUtils.getMessage("client_debug_log"));
    const debugLogCtrl: DwtComposite = new DwtComposite({parent: debugLogGroup});
    this.mErrorTextArea = new DwtInputField({
      forceMultiRow: true,
      initialValue: ZmMsg.loading,
      parent: debugLogCtrl,
      rows: 12,
    });
    this.mErrorTextArea.setEnabled(false);
    const toolbar: DwtToolBar = new DwtToolBar({parent: debugLogCtrl});
    const sendButton = new DwtButton({
        className: "ZToolbarButton ZNewButton",
        parent: toolbar,
      });
    sendButton.addSelectionListener(
      new AjxListener(this, this.sendDebugLogByEmail),
    );
    sendButton.setImage("Forward");
    sendButton.setText(ZmMsg.sendAsEmail);
    const downloadButton: DwtButton = new DwtButton({
      className: "ZToolbarButton ZNewButton",
      parent: toolbar,
    });
    downloadButton.addSelectionListener(
      new AjxListener(
        LogEngine,
        LogEngine.exportToFile,
        [],
      ),
    );
    downloadButton.setImage("DownArrow");
    downloadButton.setText(ZmMsg.download);
    debugLogGroup.setView(debugLogCtrl);

    const resetGroup: DwtGrouper = new DwtGrouper(this.mDebugTab);
    resetGroup.setLabel(StringUtils.getMessage("debug_tools"));
    const resetCtrl: DwtComposite = new DwtComposite({parent: resetGroup});
    const toolbarReset = new DwtToolBar({parent: resetCtrl});
    const label: DwtLabel = new DwtLabel({parent: toolbarReset});
    label.setText(StringUtils.getMessage("reset_connection"));
    this.mResetButton = new DwtButton({
      className: "ZToolbarButton ZNewButton",
      parent: toolbarReset,
    });
    this.mResetButton.addSelectionListener(
      new AjxListener(this, this.resetConnection),
    );
    this.mResetButton.setText(ZmMsg.reset);
    resetGroup.setView(resetCtrl);

    this.mTabIds[SettingsDialog.DEBUG_TAB] = group.addTab(
      StringUtils.getMessage("debug_info"),
      this.mDebugTab,
    );
  }

  private showDebugTab(): void {
    this.mDebugTabButton.setVisible(true);
  }

  private hideDebugTab(): void {
    this.mDebugTabButton.setVisible(false);
  }

  private sendDebugLogByEmail(): void {
    const logData: string = this.mErrorTextArea.getValue();
    const date: Date = this.mDateProvider.getNow();
    const sessionInfo: IOpenChatSessionInfo = this.mStore.getState().sessionInfo;
    const email: {} = {
        action: ZmOperation.NEW_MESSAGE,
        callback: new Callback(null, this.attachLogToMail, "complete_chat_debug_log.log", logData),
        composeMode: "text/plain",
        extraBodyText: `${StringUtils.getMessage("mail_body_prefix_chat_debug_log")}\n${logData}`,
        subjOverride: StringUtils.getMessage(
          `mail_title_prefix_chat_debug_log`,
          [`${sessionInfo.username}/${sessionInfo.sessionId} - ${date.getTime()}`],
        ),
      };
    AjxDispatcher.run("Compose", email);
    this.popdown();
  }

  private attachLogToMail(fileName: string, logData: string, controller: ZmComposeController): void {
    if (Version.isZ8Up() && (Bowser.chrome || Bowser.firefox)) {
      let file: File;
      if (Version.isZ8_5Up()) {
        file = new File(logData.split("\n"), fileName);
        controller._initUploadMyComputerFile([file]);
      } else {
        file = new File(logData.split("\n"), fileName);
        controller._uploadMyComputerFile([file]);
      }
    }
  }

//      ###*
//        TODO: This function does not work properly and is not sure if it work in IE. Need more work
//        @param {ZmComposeController} composeController
//        replace in _sendDebugLogByEmail email.callback: (new Callback(
//          appCtxt.getUploadManager(),
//          @_attachLogToMail,
//          "complete_chat_debug_log.log",
//          logData
//        )).toClosure()
//      ###
//      _attachLogToMailOld: (fileName, logData, controller) ->
//          try
//            #@ is ZmUploadManager
//            #appCtxt
//            #controller
//            ## from logData to file and everything should be resolved
//            file = new File(logData.split('\n'), fileName)
//            controller._preUploadAll(fileName)
//            req = new XMLHttpRequest() # we do not call this function in IE
//            curView = controller._composeView
//            if not curView? then return
//            @upLoadC = @upLoadC + 1
//
//            if not prevData?
//              prevData = []
//              start = 1
//            else
//              start += 1
//
//            req.open("POST", appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw", true)
//            req.setRequestHeader("Cache-Control", "no-cache")
//            req.setRequestHeader("X-Requested-With", "XMLHttpRequest")
//            req.setRequestHeader("Content-Type", "text/x-log;")
//            req.setRequestHeader("Content-Disposition", "attachment; filename=\"#{fileName}\"")
//            if (window.csrfToken)
//              req.setRequestHeader("X-Zimbra-Csrf-Token", window.csrfToken)
//
//    #        curView._startUploadAttachment()
//            curView._attButton.setEnabled(false);
//            controller._uploadingProgress = true;
//
//            # DBG.println(AjxDebug.DBG1,"Uploading file: "  + fileName +
//            #   " file type" + (file.type || "application/octet-stream") );
//            @_uploadAttReq = req
//            if AjxEnv.supportsHTML5File
//              req.upload.addEventListener(
//                "progress"
//                do (curView) ->
//                  (evt) ->
//                    curView._uploadFileProgress(evt)
//                false
//              )
//            else
//              progress = (obj) ->
//                viewObj = obj
//                viewObj.si = window.setInterval(
//                  do (viewObj) ->
//                    () -> viewObj._progress()
//                  500
//                )
//              progress(curView)
//
//            params = {
//              allResponses: prevData,
//              start: start,
//              files: [file],
//              totalSize: file.size,
//              uploadedSize: 0
//            }
//            req.onreadystatechange = @_handleUploadResponse.bind(@, req, fileName, params)
//            req.send(file)
//          catch exp
//            # DBG.println("Error while uploading file: "  + fileName);
//            # DBG.println("Exception: "  + exp);
//            appCtxt._composeView._resetUpload(true)
//            msgDlg = appCtxt.getMsgDialog()
//            @upLoadC = @upLoadC - 1
//            msgDlg.setMessage(ZmMsg.importErrorUpload, DwtMessageDialog.CRITICAL_STYLE)
//            msgDlg.popup()
//            return false
//    #    uploadFcn.call(composeController, @appCtxt, fileName, logData)}

  private resetConnection(): void {
    this.mConnectionManager.closeStream();
    this.mStore.dispatch<IResetSessionInfoAction>({ type: "RESET_SESSION_INFO" });
    this.mConnectionManager.openStream();
    this.popdown();
  }

}
