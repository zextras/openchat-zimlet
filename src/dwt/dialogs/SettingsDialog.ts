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

import {DwtDialog} from "../../zimbra/ajax/dwt/widgets/DwtDialog";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {ChatClient} from "../../client/ChatClient";
import {SessionInfoProvider} from "../../client/SessionInfoProvider";
import {SettingsManager} from "../../settings/SettingsManager";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "../../lib/DateProvider";
import {StringUtils} from "../../lib/StringUtils";
import {Setting} from "../../settings/Setting";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {
  DwtTabButton,
  DwtTabView, DwtTabViewPage
} from "../../zimbra/ajax/dwt/widgets/DwtTabView";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {Callback} from "../../lib/callbacks/Callback";
import {ZmApp} from "../../zimbra/zimbraMail/core/ZmApp";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtCheckbox} from "../../zimbra/ajax/dwt/widgets/DwtCheckbox";
import {
  DwtSelect,
  DwtSelectOption, DwtSelectOptionData
} from "../../zimbra/ajax/dwt/widgets/DwtSelect";
import {DwtGrouper} from "../../zimbra/ajax/dwt/widgets/DwtGrouper";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";
import {IdGenerator} from "../IdGenerator";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {Logger} from "../../lib/log/Logger";
import {LogEngine} from "../../lib/log/LogEngine";
import {DwtInputField} from "../../zimbra/ajax/dwt/widgets/DwtInputField";
import {DwtTabGroup} from "../../zimbra/ajax/dwt/keyboard/DwtTabGroup";
import {DwtToolBar} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {DwtButton} from "../../zimbra/ajax/dwt/widgets/DwtButton";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {ZmOperation} from "../../zimbra/zimbraMail/core/ZmOperation";
import {ZmComposeController} from "../../zimbra/zimbraMail/mail/controller/ZmComposeController";
import {Version} from "../../lib/Version";
import {Bowser} from "../../libext/bowser";

export class SettingsDialog extends DwtDialog {

  private static width: number = 480;
  private static height: number = 327;
  private static PREF_TAB: string = "pref_tab";
  private static CONTENTS_TAB: string = "contents_tab";
  private static INFO_TAB: string = "info_tab";
  private static DEBUG_TAB: string = "debug_tab";

  private static dialog: SettingsDialog = null;

  private mLog: Logger = LogEngine.getLogger(LogEngine.CHAT);
  private mAppCtxt: ZmAppCtxt;
  private mClient: ChatClient;
  private mSessionInfoProvider: SessionInfoProvider;
  private mPreferenceManager: SettingsManager;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mDateProvider: DateProvider;
  private mSettingsObjs: { [key: string]: DwtControl };
  private mOriginals: { [key: string]: string | boolean };
  private mTabIds: { [tab: string]: number };
  private mOnPopDownSwitchToFirstTabCallback: Callback;
  private mDebugTabButton: DwtTabButton;
  private mDebugInfoCheckbox: DwtCheckbox;
  private mErrorTextArea: DwtInputField;
  private mDebugTab: DwtTabViewPage;
  private mResetButton: DwtButton;

  constructor(appCtxt: ZmAppCtxt,
              shell: DwtShell,
              client: ChatClient,
              sessionInfoProvider: SessionInfoProvider,
              preferenceManager: SettingsManager,
              timedCallbackFactory: TimedCallbackFactory,
              dateProvider: DateProvider) {
    super({
      parent: shell,
      title: StringUtils.getMessage("title_chat_preferences")
    });
    this.mAppCtxt = appCtxt;
    this.mClient = client;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mPreferenceManager = preferenceManager;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mDateProvider = dateProvider;
    this.mSettingsObjs = {};
    this.mOriginals = {};
    this.mTabIds = {};
    this.loadOriginalValues();
    this.setButtonListener(
      DwtDialog.OK_BUTTON,
      new AjxListener(this, this.okBtnListener)
    );
    this.addListener(
      DwtEvent.ENTER,
      new AjxListener(this, this.okBtnListener)
    );
    let view: DwtComposite = new DwtComposite(this);
    view.setSize(
      SettingsDialog.width,
      SettingsDialog.height
    );
    let tabView: DwtTabView = new DwtTabView(view);
    tabView.setSize(
      SettingsDialog.width,
      Dwt.DEFAULT
    );
    this.mOnPopDownSwitchToFirstTabCallback = new Callback(tabView, tabView.switchToTab, "1");
    if (typeof ZmApp.ENABLED_APPS[ZmApp.PREFERENCES] !== "undefined" && ZmApp.ENABLED_APPS[ZmApp.PREFERENCES]) {
      this.addPreferencesTab(tabView);
      this.addContentDisplaySettingsTab(tabView);
    }
    this.addInfoTab(tabView);
    this.addDebugTab(tabView);
    this.mDebugTabButton = tabView.getTabButton(this.mTabIds[SettingsDialog.DEBUG_TAB]);
    this.hideDebugTab();
    this.setView(view);
  }

  private loadOriginalValues(): void {
    let valuesToLoad: string[] = [
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
      Setting.IM_PREF_IDLE_TIMEOUT
    ];
    for (let key of valuesToLoad) {
      this.mOriginals[key] = this.mPreferenceManager.get(key);
    }
  }

  private okBtnListener(): void {
    this.setValues(this.getSettingsModifications());
    this.loadOriginalValues();
    this.popdown();
  }

  private setValues(modifications: { [key: string]: string | boolean }): void {
    for (let key in modifications) {
      if (!modifications.hasOwnProperty(key)) continue;
      this.mPreferenceManager.set(key, modifications[key]);
    }
  }

  private getSettingsModifications(): { [key: string]: string | boolean } {
    let checkboxes: string[] = [
      Setting.IM_USR_PREF_EMOJI_IN_CONV,
      Setting.IM_USR_PREF_EMOJI_IN_HIST,
      Setting.IM_USR_PREF_EMOJI_IN_MAIL,
      Setting.IM_USR_PREF_URL_IN_CONV,
      Setting.IM_USR_PREF_URL_IN_HIST,
      Setting.IM_USR_PREF_URL_IN_MAIL,
      Setting.IM_PREF_NOTIFY_SOUNDS,
      Setting.IM_PREF_FLASH_BROWSER,
      Setting.IM_PREF_DESKTOP_ALERT,
      Setting.IM_PREF_REPORT_IDLE
    ];
    let mods: { [key: string]: string | boolean } = {};
    for (let key in this.mOriginals) {
      if (!this.mOriginals.hasOwnProperty(key) || typeof this.mSettingsObjs[key] === "undefined") continue;
      let isCheckBox: boolean = false;
      for (let checkBoxId of checkboxes) {
        if (key === checkBoxId) {
          if (this.mOriginals[key] !== (<DwtCheckbox>this.mSettingsObjs[key]).isSelected()) {
            mods[key] = (<DwtCheckbox>this.mSettingsObjs[key]).isSelected();
          }
          isCheckBox = true;
          break;
        }
      }
      if (!isCheckBox) {
        if (this.mOriginals[key] !== (<DwtSelect>this.mSettingsObjs[key]).getValue()) {
          mods[key] = (<DwtSelect>this.mSettingsObjs[key]).getValue();
        }
      }
    }
    return mods;
  }

  private addPreferencesTab(group: DwtTabView): void {
    let prefTab: DwtTabViewPage = new DwtTabViewPage(group),
      idleGroup: DwtGrouper = new DwtGrouper(prefTab);
    idleGroup.setLabel(StringUtils.getMessage("pref_title_idle"));
    let idleCtrl: DwtComposite = new DwtComposite({parent: idleGroup}),
      enableIdleDetection = new DwtCheckbox({
        parent: idleCtrl,
        name: Setting.IM_PREF_REPORT_IDLE,
        checked: <boolean>this.mOriginals[Setting.IM_PREF_REPORT_IDLE]
      });
    enableIdleDetection.setText(StringUtils.getMessage("pref_title_idle_enabled"));
    let idleTimeoutLabel: DwtLabel = new DwtLabel({parent: idleCtrl});
    idleTimeoutLabel.setText(`${StringUtils.getMessage("pref_title_idle_timeout")}:`);
    let idleOptions: DwtSelectOption[] = [];
    for (let minutes of ["1", "5", "10", "20", "30", "60"]) {
      let minutesText: string = minutes === "1" ? ZmMsg.minute : ZmMsg.minutes,
        text: string = `${minutes} ${minutesText}`;
      idleOptions.push(new DwtSelectOption(
        minutes,
          this.mOriginals[Setting.IM_PREF_IDLE_TIMEOUT] === minutes,
        text
        )
      );
    }
    this.mSettingsObjs[Setting.IM_PREF_REPORT_IDLE] = enableIdleDetection;
    this.mSettingsObjs[Setting.IM_PREF_IDLE_TIMEOUT] = new DwtSelect({
      parent: idleCtrl,
      // name: Setting.IM_PREF_IDLE_TIMEOUT,
      options: idleOptions,
      id: IdGenerator.generateId("ZxChat_ChatSettingsSelectTimeout")
    });
    idleGroup.setView(idleCtrl);

    let contactGroup: DwtGrouper = new DwtGrouper(prefTab);
    contactGroup.setLabel(StringUtils.getMessage("buddy_list"));
    let contactCtrl: DwtComposite = new DwtComposite({parent: contactGroup}),
      orderLabel: DwtLabel = new DwtLabel({parent: contactCtrl});
    orderLabel.setText(`${StringUtils.getMessage("pref_title_display_order")}:`);
    this.mSettingsObjs[Setting.IM_PREF_BUDDY_SORT] = new DwtSelect({
      parent: contactCtrl,
      // name: Setting.IM_PREF_BUDDY_SORT,
      options: [
        new DwtSelectOption(
          Setting.BUDDY_SORT_NAME,
          this.mOriginals[Setting.IM_PREF_BUDDY_SORT] === Setting.BUDDY_SORT_NAME,
          StringUtils.getMessage("add_friends_username")
        ),
        new DwtSelectOption(
          Setting.BUDDY_SORT_PRESENCE,
          this.mOriginals[Setting.IM_PREF_BUDDY_SORT] === Setting.BUDDY_SORT_PRESENCE,
          StringUtils.getMessage("presence")
        )
      ],
      id: IdGenerator.generateId("ZxChat_ChatSettingsSelectSort")
    });
    contactGroup.setView(contactCtrl);

    let notificationsGroup: DwtGrouper = new DwtGrouper(prefTab);
    notificationsGroup.setLabel(StringUtils.getMessage("pref_title_notifications"));
    let notificationsCtrl: DwtComposite = new DwtComposite({parent: notificationsGroup}),
      playSound = new DwtCheckbox({
        parent: notificationsCtrl,
        name: Setting.IM_PREF_NOTIFY_SOUNDS,
        checked: <boolean>this.mOriginals[Setting.IM_PREF_NOTIFY_SOUNDS]
      });
    playSound.setText(StringUtils.getMessage("pref_title_play_sound"));
    this.mSettingsObjs[Setting.IM_PREF_NOTIFY_SOUNDS] = playSound;
    let notifyOnBrowserTitle: DwtCheckbox = new DwtCheckbox({
      parent: notificationsCtrl,
      name: Setting.IM_PREF_FLASH_BROWSER,
      checked: <boolean>this.mOriginals[Setting.IM_PREF_FLASH_BROWSER]
    });
    notifyOnBrowserTitle.setText(StringUtils.getMessage("pref_title_flash_browser_title"));
    this.mSettingsObjs[Setting.IM_PREF_FLASH_BROWSER] = notifyOnBrowserTitle;
    let desktopAlert: DwtCheckbox = new DwtCheckbox({
      parent: notificationsCtrl,
      name: Setting.IM_PREF_DESKTOP_ALERT,
      checked: <boolean>this.mOriginals[Setting.IM_PREF_DESKTOP_ALERT]
    });
    desktopAlert.setText(StringUtils.getMessage("pref_title_desktop_notification_chrome"));
    this.mSettingsObjs[Setting.IM_PREF_DESKTOP_ALERT] = desktopAlert;
    // # TODO: Add here the link to popup the desktop notifications
    notificationsGroup.setView(notificationsCtrl);

    this.mTabIds[SettingsDialog.PREF_TAB] = group.addTab(
      ZmMsg.preferences,
      prefTab,
      `${this.getHTMLElId()}_pref_tab`
    );
  }

  private addContentDisplaySettingsTab(group: DwtTabView): void {
    let contentTab: DwtTabViewPage = new DwtTabViewPage(group);

    let displayEmojiOptsGroup: DwtGrouper = new DwtGrouper(contentTab);
    displayEmojiOptsGroup.setLabel(StringUtils.getMessage("label_emoji_display_options"));
    let displayOptsCtrl: DwtComposite = new DwtComposite({parent: displayEmojiOptsGroup});
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_EMOJI_IN_CONV, displayOptsCtrl, StringUtils.getMessage("label_enable_emoji_in_chat"));
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_EMOJI_IN_HIST, displayOptsCtrl, StringUtils.getMessage("label_enable_emoji_in_chat_history"));
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_EMOJI_IN_MAIL, displayOptsCtrl, StringUtils.getMessage("label_enable_emoji_in_mail"));
    displayEmojiOptsGroup.setView(displayOptsCtrl);

    let displayUrlOptsGroup: DwtGrouper = new DwtGrouper(contentTab);
    displayUrlOptsGroup.setLabel(StringUtils.getMessage("label_url_display_options"));
    let displayUrlOptsCtrl: DwtComposite = new DwtComposite({parent: displayUrlOptsGroup});
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_URL_IN_CONV, displayUrlOptsCtrl, StringUtils.getMessage("label_enable_url_in_chat"));
    this.addCheckboxInContentTab(Setting.IM_USR_PREF_URL_IN_HIST, displayUrlOptsCtrl, StringUtils.getMessage("label_enable_url_in_chat_history"));
    // this.addCheckboxInContentTab(Setting.IM_USR_PREF_URL_IN_MAIL, displayUrlOptsCtrl, StringUtils.getMessage("label_enable_url_in_mail"));
    displayUrlOptsGroup.setView(displayUrlOptsCtrl);

    this.mTabIds[SettingsDialog.CONTENTS_TAB] = group.addTab(
      StringUtils.getMessage("title_contents"),
      contentTab,
      `${this.getHTMLElId()}_contents_tab`
    );
  }

  private addCheckboxInContentTab(setting: string, parent: DwtComposite, message: string): void {
    let checkbox: DwtCheckbox = new DwtCheckbox({
      parent: parent,
      name: setting,
      checked: <boolean>this.mOriginals[setting]
    });
    checkbox.setText(message);
    this.mSettingsObjs[setting] = checkbox;
  }

  private addInfoTab(group: DwtTabView): void {
    let infoTab: DwtTabViewPage = new DwtTabViewPage(group),
      copyrightGroup: DwtGrouper = new DwtGrouper(infoTab);
    copyrightGroup.setLabel("Copyright");
    let copyrightCtrl: DwtComposite = new DwtComposite({parent: copyrightGroup}),
      copyrightLabel: DwtLabel = new DwtLabel({parent: copyrightCtrl});
    copyrightLabel.setText("Zextras");
    copyrightGroup.setView(copyrightCtrl);

    let versionGroup: DwtGrouper = new DwtGrouper(infoTab);
    versionGroup.setLabel(`${StringUtils.getMessage("current_zimlet_version")}`);
    let versionCtrl: DwtComposite = new DwtComposite({parent: versionGroup}),
      testingMessage: string = "";
    if (this.mPreferenceManager.isZimletTesting()) {
      testingMessage = " <span style=\"color: #FF0000; font-weight:bold;\">TESTING</span>";
    }
    let versionMsg: string =
      `${this.mPreferenceManager.getZimletVersion().toString()}${testingMessage}
      <a href=\"https://github.com/ZeXtras/openchat-zimlet/tree/${this.mPreferenceManager.getZimletCommitId()}\" target=\"_blank\">
        @${this.mPreferenceManager.getZimletCommitId()}
      </a>`;
    let versionLabel: DwtLabel = new DwtLabel({parent: versionCtrl});
    versionLabel.setText(versionMsg);
//    if @preferenceManager.getZimletVersion().lessThan(@preferenceManager.getZimletAvailableVersion())
//      updateStatus = new DwtLabel({parent: versionCtrl})
//      updateStatus.setText(
//        """
//        <b>#{StringUtils.getMessage("available_zimlet_version")}:</b> #{@preferenceManager.getZimletAvailableVersion().toString()}
//        """
//      )
    versionGroup.setView(versionCtrl);

    let creditGroup: DwtGrouper = new DwtGrouper(infoTab);
    creditGroup.setLabel(StringUtils.getMessage("label_credits"));
    let creditCtrl: DwtComposite = new DwtComposite({parent: creditGroup}),
      translationCredits = new DwtLabel({parent: creditCtrl});
    translationCredits.setText(
      `${StringUtils.getMessage("pref_help_translate")} - <a href='http://wiki.zextras.com/wiki/I18n_-_Internationalization_and_Localization' target=_blank>Community Translation Team</a>`
    );
    let emojiDisclaimer: DwtLabel = new DwtLabel({parent: creditCtrl});
    emojiDisclaimer.setText(
      `Emoji provided free by <a href="http://emojione.com" target="_blank">Emoji One</a>`
    );
    creditGroup.setView(creditCtrl);

    let debugGroup: DwtGrouper = new DwtGrouper(infoTab);
    debugGroup.setLabel(StringUtils.getMessage("label_debug"));
    let debugCtrl: DwtComposite = new DwtComposite({parent: debugGroup});
    this.mDebugInfoCheckbox = new DwtCheckbox({
      parent: debugCtrl,
      name: SettingsDialog.DEBUG_TAB,
      checked: false
    });
    this.mDebugInfoCheckbox.setText(StringUtils.getMessage("enable_debug_info"));
    this.mDebugInfoCheckbox.addSelectionListener(new AjxListener(this, this.selectionListener));
    debugGroup.setView(debugCtrl);
    this.mTabIds[SettingsDialog.INFO_TAB] = group.addTab(
      StringUtils.getMessage("pref_title_about"),
      infoTab,
      `${this.getHTMLElId()}_about_tab`
    );
  }

  private selectionListener(ev: DwtSelectionEvent): void {
    let setErrorText: () => void = () => this.mErrorTextArea.setValue(this.mLog.exportLog());
    if (this.mDebugInfoCheckbox.isSelected()) {
      this.showDebugTab();
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(this, setErrorText),
        10
      ).start();
    }
    else {
      this.hideDebugTab();
    }
  }

  private addDebugTab(group: DwtTabView): void {
    if (typeof this.mDebugTab !== "undefined" && this.mDebugTab !== null) {
      return;
    }
    this.mDebugTab = new DwtTabViewPage(group);
    let debugLogGroup: DwtGrouper = new DwtGrouper(this.mDebugTab);
    debugLogGroup.setLabel(StringUtils.getMessage("client_debug_log"));
    let debugLogCtrl: DwtComposite = new DwtComposite({parent: debugLogGroup});
    this.mErrorTextArea = new DwtInputField({
      parent: debugLogCtrl,
      forceMultiRow: true,
      rows: 12,
      initialValue: ZmMsg.loading
    });
    this.mErrorTextArea.setEnabled(false);
    let toolbar: DwtToolBar = new DwtToolBar({parent: debugLogCtrl}),
      sendButton = new DwtButton({
        parent: toolbar,
        className: "ZToolbarButton ZNewButton"
      });
    sendButton.addSelectionListener(
      new AjxListener(this, this.sendDebugLogByEmail)
    );
    sendButton.setImage("Forward");
    sendButton.setText(ZmMsg.sendAsEmail);
    let downloadButton: DwtButton = new DwtButton({
      parent: toolbar,
      className: "ZToolbarButton ZNewButton"
    });
    downloadButton.addSelectionListener(
      new AjxListener(
        LogEngine,
        LogEngine.exportToFile,
        []
      )
    );
    downloadButton.setImage("DownArrow");
    downloadButton.setText(ZmMsg.download);
    debugLogGroup.setView(debugLogCtrl);

    let resetGroup: DwtGrouper = new DwtGrouper(this.mDebugTab);
    resetGroup.setLabel(StringUtils.getMessage("debug_tools"));
    let resetCtrl: DwtComposite = new DwtComposite({parent: resetGroup}),
      toolbarReset = new DwtToolBar({parent: resetCtrl});
    let label: DwtLabel = new DwtLabel({parent: toolbarReset});
    label.setText(StringUtils.getMessage("reset_connection"));
    this.mResetButton = new DwtButton({
      parent: toolbarReset,
      className: "ZToolbarButton ZNewButton"
    });
    this.mResetButton.addSelectionListener(
      new AjxListener(this, this.resetConnection)
    );
    this.mResetButton.setText(ZmMsg.reset);
    resetGroup.setView(resetCtrl);

    this.mTabIds[SettingsDialog.DEBUG_TAB] = group.addTab(
      StringUtils.getMessage("debug_info"),
      this.mDebugTab
    );
  }

  private showDebugTab(): void {
    this.mDebugTabButton.setVisible(true);
  }

  private hideDebugTab(): void {
    this.mDebugTabButton.setVisible(false);
  }

  private sendDebugLogByEmail(): void {
    let logData: string = this.mErrorTextArea.getValue(),
      date: Date = this.mDateProvider.getNow(),
      email: {} = {
        action: ZmOperation.NEW_MESSAGE,
        subjOverride: StringUtils.getMessage(`mail_title_prefix_chat_debug_log`, [`${this.mSessionInfoProvider.getUsernameWithResource()} - ${date.getTime()}`]),
        extraBodyText: `${StringUtils.getMessage("mail_body_prefix_chat_debug_log")}\n${logData}`,
        composeMode: "text/plain",
        callback: new Callback(null, this.attachLogToMail, "complete_chat_debug_log.log", logData)
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
      }
      else {
        file = new File(logData.split("\n"), fileName);
        controller._uploadMyComputerFile([file]);
      }
    }
  }

//      ###*
//        TODO: This function does not work properly and is not sure if it work in IE. Need more work
//        @param {ZmComposeController} composeController
//        replace in _sendDebugLogByEmail email.callback: (new Callback(appCtxt.getUploadManager(), @_attachLogToMail, "complete_chat_debug_log.log", logData)).toClosure()
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
//            # DBG.println(AjxDebug.DBG1,"Uploading file: "  + fileName + " file type" + (file.type || "application/octet-stream") );
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
    this.mClient.shutdown();
    this.mClient.registerSession();
    this.popdown();
  }

  public getTabKeys(): string[] {
    let toReturn: string[] = [];
    for (let name in this.mTabIds) {
      if (!this.mTabIds.hasOwnProperty(name)) continue;
      toReturn.push(name);
    }
    return toReturn;
  }

  public static getDialog(
    appCtxt: ZmAppCtxt,
    shell: DwtShell,
    client: ChatClient,
    sessionInfoProvider: SessionInfoProvider,
    preferenceManager: SettingsManager,
    timedCallbackFactory: TimedCallbackFactory,
    dateProvider: DateProvider
  ): SettingsDialog {
    if (typeof SettingsDialog.dialog === "undefined" || SettingsDialog.dialog === null) {
      SettingsDialog.dialog = new SettingsDialog(
        appCtxt,
        shell,
        client,
        sessionInfoProvider,
        preferenceManager,
        timedCallbackFactory,
        dateProvider
      );
    }
    SettingsDialog.dialog.hideDebugTab();
    SettingsDialog.dialog.getDebugInfoCheckbox().setSelected(false);
    SettingsDialog.dialog.getErrorTextArea().setValue(ZmMsg.loading);
    return SettingsDialog.dialog;
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
}