#
# Copyright (C) 2017 ZeXtras S.r.l.
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation, version 2 of
# the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License.
# If not, see <http://www.gnu.org/licenses/>.
#

define(
  [
    "require",
    "exports",
    "../../libext/bowser",
    '../../lib/log/LogEngine',
    '../../lib/Graphic',
    '../../lib/StringUtils',
    "../../lib/Version",
    '../../lib/callbacks/Callback',
    "../../zimbra/ajax/boot/AjxDispatcher",
    "../../zimbra/ajax/events/AjxListener",
    "../../zimbra/ajax/dwt/core/Dwt"
    "../../zimbra/ajax/dwt/widgets/DwtComposite"
    "../../zimbra/ajax/dwt/widgets/DwtCheckbox"
    "../../zimbra/ajax/dwt/widgets/DwtButton"
    "../../zimbra/ajax/dwt/widgets/DwtDialog"
    "../../zimbra/ajax/dwt/widgets/DwtGrouper"
    "../../zimbra/ajax/dwt/widgets/DwtInputField"
    "../../zimbra/ajax/dwt/widgets/DwtLabel"
    "../../zimbra/ajax/dwt/widgets/DwtSelect"
    "../../zimbra/ajax/dwt/widgets/DwtTabView"
    "../../zimbra/ajax/dwt/widgets/DwtToolBar"
    "../../zimbra/ajax/dwt/events/DwtEvent"
    "../../zimbra/zimbraMail/core/ZmOperation"
    "../../zimbra/zimbraMail/core/ZmApp"
    "../../zimbra/zimbraMail/ZmMsg",
    '../../settings/Setting',
    '../IdGenerator'
  ],
  (
    require,
    exports,
    Bowser_1,
    LogEngine_1,
    Graphic_1,
    StringUtils_1,
    Version_1,
    Callback_1,
    AjxDispatcher_1,
    AjxListener_1,
    Dwt_1,
    DwtComposite_1,
    DwtCheckbox_1,
    DwtButton_1,
    DwtDialog_1,
    DwtGrouper_1,
    DwtInputField_1,
    DwtLabel_1,
    DwtSelect_1,
    DwtTabView_1,
    DwtToolBar_1,
    DwtEvent_1,
    ZmOperation_1,
    ZmApp_1,
    ZmMsg_1,
    Setting_1,
    IdGenerator_1
  ) ->
    "use strict"

    Bowser = Bowser_1.Bowser
    AjxDispatcher = AjxDispatcher_1.AjxDispatcher
    AjxListener = AjxListener_1.AjxListener
    Dwt = Dwt_1.Dwt
    DwtComposite = DwtComposite_1.DwtComposite
    DwtCheckbox = DwtCheckbox_1.DwtCheckbox
    DwtButton = DwtButton_1.DwtButton
    DwtDialog = DwtDialog_1.DwtDialog
    DwtGrouper = DwtGrouper_1.DwtGrouper
    DwtInputField = DwtInputField_1.DwtInputField
    DwtLabel = DwtLabel_1.DwtLabel
    DwtSelect = DwtSelect_1.DwtSelect
    DwtSelectOption = DwtSelect_1.DwtSelectOption
    DwtTabView = DwtTabView_1.DwtTabView
    DwtTabViewPage = DwtTabView_1.DwtTabViewPage
    DwtToolBar = DwtToolBar_1.DwtToolBar
    DwtEvent = DwtEvent_1.DwtEvent
    ZmOperation = ZmOperation_1.ZmOperation
    ZmApp = ZmApp_1.ZmApp
    ZmMsg = ZmMsg_1.ZmMsg

    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)
    Graphic = Graphic_1.Graphic
    StringUtils = StringUtils_1.StringUtils
    Version = Version_1.Version

    Setting = Setting_1.Setting
    IdGenerator = IdGenerator_1.IdGenerator
    Callback = Callback_1.Callback

    class SettingsDialog extends DwtDialog

      @_width = 480
      @_height = 297
      @_PREF_TAB  = 'pref_tab'
      @_EMOJI_TAB = 'emoji_tab'
      @_INFO_TAB  = 'info_tab'
      @_DEBUG_TAB = 'debug_tab'

      @_dialog = null

      ###*
        @param {ZmAppCtxt} appCtxt
        @param {DwtShell} shell
        @param {ChatClient} client
        @param {SessionInfoProvider} sessionInfoProvider
        @param {SettingsManager} preferenceManager
        @param {TimedCallbackFactory} timedCallbackFactory
        @constructor
      ###
      constructor: (appCtxt, shell, client, sessionInfoProvider, preferenceManager, timedCallbackFactory, dateProvider) ->
        @appCtxt = appCtxt
        @client = client
        @mSessionInfoProvider = sessionInfoProvider
        @preferenceManager = preferenceManager
        @mTimedCallbackFactory = timedCallbackFactory
        @dateProvider = dateProvider
        @settingsObjs = {}
        @_originals = {}
        @_tabIds = {}
        @_loadOriginalValues()
        super({
          parent: shell
          title: StringUtils.getMessage("title_chat_preferences")
        })
        @setButtonListener(
          DwtDialog.OK_BUTTON,
          new AjxListener(@, @_okBtnListener)
        )
        @addListener(
          DwtEvent.ENTER
          new AjxListener(@, @_okBtnListener)
        )
        view = new DwtComposite(@)
        view.setSize(
          SettingsDialog._width
          SettingsDialog._height
        )
        tabView = new DwtTabView(view)
        tabView.setSize(
          SettingsDialog._width
          Dwt.DEFAULT
        )
        @_onPopdownSwitchToFirstTabCallback = new Callback(tabView, tabView.switchToTab, 1)
        # Add the preference tab only if the user has the permission to modify his own
        #   preferences
        if ZmApp.ENABLED_APPS[ZmApp.PREFERENCES]?
          @_addPreferencesTab(tabView)
          @_addEmojiSettingsTab(tabView)
        @_addInfoTab(tabView)
        @_addDebugTab(tabView)

        @debugTabButton = tabView.getTabButton(@_tabIds[SettingsDialog._DEBUG_TAB])
        @_hideDebugTab()
        @setView(view)

      _loadOriginalValues: () ->
        valuesToLoad = [
          Setting.IM_USR_PREF_EMOJI_IN_CONV
          Setting.IM_USR_PREF_EMOJI_IN_HIST
          Setting.IM_USR_PREF_EMOJI_IN_MAIL
          Setting.IM_PREF_BUDDY_SORT
          Setting.IM_PREF_NOTIFY_SOUNDS
          Setting.IM_PREF_FLASH_BROWSER
          Setting.IM_PREF_DESKTOP_ALERT
          Setting.IM_PREF_REPORT_IDLE
          Setting.IM_PREF_IDLE_TIMEOUT
        ]
        for key in valuesToLoad
          @_originals[key] = @preferenceManager.get(key)

      #
      # Callback invoked on "ok" button selection.
      #
      _okBtnListener: () ->
        @_setValues(
          @_getSettingsModifications()
        )
        @_loadOriginalValues()
        @popdown()

      #
      # For every (key, value) store the modified settings.
      # @param {{}} modifications
      #
      _setValues: (modifications) ->
        for own key, value of modifications
          @preferenceManager.set(key, value)

      #
      # Find the modifications of the settings.
      # @return {{}}
      #
      _getSettingsModifications: () ->
        checkboxes = [
          Setting.IM_USR_PREF_EMOJI_IN_CONV
          Setting.IM_USR_PREF_EMOJI_IN_HIST
          Setting.IM_USR_PREF_EMOJI_IN_MAIL
          Setting.IM_PREF_NOTIFY_SOUNDS
          Setting.IM_PREF_FLASH_BROWSER
          Setting.IM_PREF_DESKTOP_ALERT
          Setting.IM_PREF_REPORT_IDLE
        ]
        mods = {}
        for own key, value of @_originals
          if not @settingsObjs[key]? then continue
          if key in checkboxes
            if value != @settingsObjs[key].isSelected()
              mods[key] = @settingsObjs[key].isSelected()
          else
            if value != @settingsObjs[key].getValue()
              mods[key] = @settingsObjs[key].getValue()
        mods

      #
      # Add the tab of the preferences, if
      # @param {DwtTabView} group
      #
      _addPreferencesTab: (group) ->
        prefTab = new DwtTabViewPage(group)

        idleGroup = new DwtGrouper(prefTab)
        idleGroup.setLabel(StringUtils.getMessage('pref_title_idle'))
        idleCtrl = new DwtComposite({parent: idleGroup})
        enableIdleDetection = new DwtCheckbox({
          parent: idleCtrl
          name: Setting.IM_PREF_REPORT_IDLE
          checked: @_originals[Setting.IM_PREF_REPORT_IDLE]
        })
        enableIdleDetection.setText(StringUtils.getMessage('pref_title_idle_enabled'))
        idleTimeoutLabel = new DwtLabel({ parent: idleCtrl })
        idleTimeoutLabel.setText("#{StringUtils.getMessage('pref_title_idle_timeout')}:")
        idleOptions = []
        for minutes in [ 1, 5, 10, 20, 30, 60 ]
          minutesText = if minutes == 1 then ZmMsg.minute else ZmMsg.minutes
          text = "#{minutes} #{minutesText}"
          idleOptions.push(new DwtSelectOption(
            minutes
              @_originals[Setting.IM_PREF_IDLE_TIMEOUT] == minutes
            text
          ))
        @settingsObjs[Setting.IM_PREF_REPORT_IDLE] = enableIdleDetection
        idleTimeSelector = new DwtSelect({
          parent: idleCtrl
          name: Setting.IM_PREF_IDLE_TIMEOUT
          options: idleOptions
          id: IdGenerator.generateId("ZxChat_ChatSettingsSelectTimeout")
        })
        @settingsObjs[Setting.IM_PREF_IDLE_TIMEOUT] = idleTimeSelector
        idleGroup.setView(idleCtrl)

        contactGroup = new DwtGrouper(prefTab)
        contactGroup.setLabel(StringUtils.getMessage('buddy_list'))
        contactCtrl = new DwtComposite({parent: contactGroup})
        orderLabel = new DwtLabel({ parent: contactCtrl })
        orderLabel.setText("#{StringUtils.getMessage('pref_title_display_order')}:")
        order = new DwtSelect({
          parent: contactCtrl
          name: Setting.IM_PREF_BUDDY_SORT
          options: [
            new DwtSelectOption(
              Setting.BUDDY_SORT_NAME,
              @_originals[Setting.IM_PREF_BUDDY_SORT] == Setting.BUDDY_SORT_NAME
              StringUtils.getMessage('add_friends_username')
            )
            new DwtSelectOption(
              Setting.BUDDY_SORT_PRESENCE,
              @_originals[Setting.IM_PREF_BUDDY_SORT] == Setting.BUDDY_SORT_PRESENCE
              StringUtils.getMessage('presence')
            )
          ]
          id: IdGenerator.generateId("ZxChat_ChatSettingsSelectSort")
        })
        @settingsObjs[Setting.IM_PREF_BUDDY_SORT] = order
        contactGroup.setView(contactCtrl)

        notificationsGroup = new DwtGrouper(prefTab)
        notificationsGroup.setLabel(StringUtils.getMessage('pref_title_notifications'))
        notificationsCtrl = new DwtComposite({parent: notificationsGroup})
        playSound = new DwtCheckbox({
          parent: notificationsCtrl
          name: Setting.IM_PREF_NOTIFY_SOUNDS
          checked: @_originals[Setting.IM_PREF_NOTIFY_SOUNDS]
        })
        playSound.setText(StringUtils.getMessage('pref_title_play_sound'))
        @settingsObjs[Setting.IM_PREF_NOTIFY_SOUNDS] = playSound
        notifyOnBrowserTitle = new DwtCheckbox({
          parent: notificationsCtrl
          name: Setting.IM_PREF_FLASH_BROWSER
          checked: @_originals[Setting.IM_PREF_FLASH_BROWSER]
        })
        notifyOnBrowserTitle.setText(StringUtils.getMessage('pref_title_flash_browser_title'))
        @settingsObjs[Setting.IM_PREF_FLASH_BROWSER] = notifyOnBrowserTitle
        desktopAlert = new DwtCheckbox({
          parent: notificationsCtrl
          name: Setting.IM_PREF_DESKTOP_ALERT
          checked: @_originals[Setting.IM_PREF_DESKTOP_ALERT]
        })
        desktopAlert.setText(StringUtils.getMessage('pref_title_desktop_notification_chrome'))
        @settingsObjs[Setting.IM_PREF_DESKTOP_ALERT] = desktopAlert
        # TODO: Add here the link to popup the desktop notifications
        notificationsGroup.setView(notificationsCtrl)

        @_tabIds[SettingsDialog._PREF_TAB] = group.addTab(
          ZmMsg.preferences
          prefTab
          "#{@getHTMLElId()}_pref_tab"
        )

      #
      # Add and create the Emoji settings tab.
      #
      _addEmojiSettingsTab: (group) ->
        emojiTab = new DwtTabViewPage(group)

        displayOptsGroup = new DwtGrouper(emojiTab)
        displayOptsGroup.setLabel(StringUtils.getMessage('label_display_options'))
        displayOptsCtrl = new DwtComposite({parent: displayOptsGroup})
        enableInChatCheckbox = new DwtCheckbox({
          parent: displayOptsCtrl
          name: Setting.IM_USR_PREF_EMOJI_IN_CONV
          checked: @_originals[Setting.IM_USR_PREF_EMOJI_IN_CONV]
        })
        enableInChatCheckbox.setText(StringUtils.getMessage("label_enable_emoji_in_chat"))
        @settingsObjs[Setting.IM_USR_PREF_EMOJI_IN_CONV] = enableInChatCheckbox
        enableInHistoryCheckbox = new DwtCheckbox({
          parent: displayOptsCtrl
          name: Setting.IM_USR_PREF_EMOJI_IN_HIST
          checked: @_originals[Setting.IM_USR_PREF_EMOJI_IN_HIST]
        })
        enableInHistoryCheckbox.setText(StringUtils.getMessage("label_enable_emoji_in_chat_history"))
        @settingsObjs[Setting.IM_USR_PREF_EMOJI_IN_HIST] = enableInHistoryCheckbox
        enableInMailCheckbox = new DwtCheckbox({
          parent: displayOptsCtrl
          name: Setting.IM_USR_PREF_EMOJI_IN_MAIL
          checked: @_originals[Setting.IM_USR_PREF_EMOJI_IN_MAIL]
        })
        enableInMailCheckbox.setText(StringUtils.getMessage("label_enable_emoji_in_mail"))
        @settingsObjs[Setting.IM_USR_PREF_EMOJI_IN_MAIL] = enableInMailCheckbox
        displayOptsGroup.setView(displayOptsCtrl)

        @_tabIds[SettingsDialog._EMOJI_TAB] = group.addTab(
          StringUtils.getMessage("title_emoji"),
          emojiTab
          "#{@getHTMLElId()}_emoji_tab"
        )

      #
      # Add the tab presenting the about info on the zimlet.
      # Will display also the version information.
      #
      _addInfoTab: (group) ->
        tab = new DwtTabViewPage(group)

        copyrightGroup = new DwtGrouper(tab)
        copyrightGroup.setLabel("Copyright")
        copyrightCtrl = new DwtComposite({parent: copyrightGroup})
        copyrightLabel = new DwtLabel({parent: copyrightCtrl})
        copyrightLabel.setText("Zextras")
        copyrightGroup.setView(copyrightCtrl)

        versionGroup = new DwtGrouper(tab)
        versionGroup.setLabel("#{StringUtils.getMessage('current_zimlet_version')}")
        versionCtrl = new DwtComposite({parent: versionGroup})
        testingMessage = ""
        if @preferenceManager.isZimletTesting()
          testingMessage = " <span style=\"color: #FF0000; font-weight:bold;\">TESTING</span>"
        versionMsg = "#{@preferenceManager.getZimletVersion().toString()}#{testingMessage} <a href=\"https://github.com/ZeXtras/openchat-zimlet/tree/#{@preferenceManager.getZimletCommitId()}\" target=\"_blank\">@#{@preferenceManager.getZimletCommitId()}</a>"
        versionLabel = new DwtLabel({parent: versionCtrl})
        versionLabel.setText(versionMsg)
#        if @preferenceManager.getZimletVersion().lessThan(@preferenceManager.getZimletAvailableVersion())
#          updateStatus = new DwtLabel({parent: versionCtrl})
#          updateStatus.setText(
#            """
#            <b>#{StringUtils.getMessage("available_zimlet_version")}:</b> #{@preferenceManager.getZimletAvailableVersion().toString()}
#            """
#          )
        versionGroup.setView(versionCtrl)

        creditGroup = new DwtGrouper(tab)
        creditGroup.setLabel(StringUtils.getMessage('label_credits'))
        creditCtrl = new DwtComposite({parent: creditGroup})
        translationCredits = new DwtLabel({parent: creditCtrl})
        translationCredits.setText(
          """
          #{StringUtils.getMessage('pref_help_translate')} - <a href='http://wiki.zextras.com/wiki/I18n_-_Internationalization_and_Localization' target=_blank>Community Translation Team</a>
          """
        )
        emojiDisclaimer = new DwtLabel({ parent: creditCtrl })
        emojiDisclaimer.setText(
          """
          Emoji provided free by <a href="http://emojione.com" target="_blank">Emoji One</a>
          """
        )
        creditGroup.setView(creditCtrl)

        debugGroup = new DwtGrouper(tab)
        debugGroup.setLabel(StringUtils.getMessage('label_debug'))
        debugCtrl = new DwtComposite({parent: debugGroup})
        @debugInfoCheckbox = new DwtCheckbox({
          parent: debugCtrl
          checked: false
        })
        @debugInfoCheckbox.setText(StringUtils.getMessage("enable_debug_info"))
        @debugInfoCheckbox.addSelectionListener(new AjxListener(@, @_selectionListener))
        debugGroup.setView(debugCtrl)
        @_tabIds[SettingsDialog._INFO_TAB] = group.addTab(
          StringUtils.getMessage("pref_title_about")
          tab
          "#{@getHTMLElId()}_about_tab"
        )

      _selectionListener: (ev) ->
        setErrorText = () -> @errorTextarea.setValue(Log.exportLog())
        if @debugInfoCheckbox.isSelected()
          @_showDebugTab()
          @mTimedCallbackFactory.createTimedCallback(
            new Callback(@, setErrorText),
            10
          ).start()
        else
          @_hideDebugTab()

      #
      # Create and add to the TabView the tab about the errors collected.
      # If there are none errors collected, the tab will not be shown.
      #
      _addDebugTab: (group) ->
        if debugTab? then return
        debugTab = new DwtTabViewPage(group)

        debugLogGroup = new DwtGrouper(debugTab)
        debugLogGroup.setLabel(StringUtils.getMessage("client_debug_log"))
        debugLogCtrl = new DwtComposite({parent: debugLogGroup})

#        label = new DwtLabel({parent: debugTab})
#        label.setText("#{StringUtils.getMessage("client_debug_log")}:")
        @errorTextarea = new DwtInputField({
          parent: debugLogCtrl
          forceMultiRow: true
          rows: 12
          initialValue: ZmMsg.loading
        })
        @errorTextarea.setEnabled(false)
        toolbar = new DwtToolBar({parent: debugLogCtrl})
        sendButton = new DwtButton({
          parent: toolbar
          className:	"ZToolbarButton ZNewButton"
        })
        sendButton.addSelectionListener(
          new AjxListener(@, @_sendDebugLogByEmail)
        )
        sendButton.setImage("Forward")
        sendButton.setText(ZmMsg.sendAsEmail)
        downloadButton = new DwtButton({
          parent: toolbar
          className: "ZToolbarButton ZNewButton"
        })
        downloadButton.addSelectionListener(
          new AjxListener(
            LogEngine_1.LogEngine
            LogEngine_1.LogEngine.exportToFile
            []
          )
        )
        downloadButton.setImage("DownArrow")
        downloadButton.setText(ZmMsg.download)
        debugLogGroup.setView(debugLogCtrl)

        resetGroup = new DwtGrouper(debugTab)
        resetGroup.setLabel(StringUtils.getMessage("debug_tools"))
        resetCtrl = new DwtComposite({parent: resetGroup})
        toolbarReset = new DwtToolBar({parent: resetCtrl})
        label = new DwtLabel({parent: toolbarReset})
        label.setText(StringUtils.getMessage("reset_connection"))
        @resetButton = new DwtButton({
          parent: toolbarReset
          className: "ZToolbarButton ZNewButton"
        })
        @resetButton.addSelectionListener(
          new AjxListener(@, @_resetConnection)
        )
        @resetButton.setText(ZmMsg.reset)
        resetGroup.setView(resetCtrl)

        @_tabIds[SettingsDialog._DEBUG_TAB] = group.addTab(
          StringUtils.getMessage("debug_info")
          debugTab
        )

      ###*
        Show the button of the debug tab.
        @private
      ###
      _showDebugTab: () ->
        @debugTabButton.setVisible(true)

      ###*
        Hide the button of the debug tab.
        @private
      ###
      _hideDebugTab: () ->
        @debugTabButton.setVisible(false)

      ###*
        Send a log by email
        @param {string} log
      ###
      _sendDebugLogByEmail: () ->
        logData = this.errorTextarea.getValue()
        date = @dateProvider.getNow()
        email = {
          action: ZmOperation.NEW_MESSAGE
          subjOverride: StringUtils.getMessage("mail_title_prefix_chat_debug_log", ["#{@mSessionInfoProvider.getUsernameWithResource()} - #{date.getTime()}"])
          extraBodyText: "#{StringUtils.getMessage("mail_body_prefix_chat_debug_log")}\n#{logData}"
          composeMode: "text/plain"
          callback: new Callback(null, @_attachLogToMail, "complete_chat_debug_log.log", logData)
        }
        AjxDispatcher.run("Compose", email)
        @popdown()

      _attachLogToMail: (fileName, logData, controller) ->
        # if Zimbra version greater than 8 then attachment is supported
        # however in internet explorer there is no way to create a File
        if Version.isZ8Up() and (Bowser.chrome or Bowser.firefox)
          if Version.isZ8_5Up()
            file = new File(logData.split('\n'), fileName)
            controller._initUploadMyComputerFile([file])
          else
            file = new File(logData.split('\n'), fileName)
            controller._uploadMyComputerFile([file])

##
##      ###*
##        TODO: This function does not work properly and is not sure if it work in IE. Need more work
##        @param {ZmComposeController} composeController
#         replace in _sendDebugLogByEmail email.callback: (new Callback(appCtxt.getUploadManager(), @_attachLogToMail, "complete_chat_debug_log.log", logData)).toClosure()
##      ###
##      _attachLogToMailOld: (fileName, logData, controller) ->
##          try
##            #@ is ZmUploadManager
##            #appCtxt
##            #controller
##            ## from logData to file and everything should be resolved
##            file = new File(logData.split('\n'), fileName)
##            controller._preUploadAll(fileName)
##            req = new XMLHttpRequest() # we do not call this function in IE
##            curView = controller._composeView
##            if not curView? then return
##            @upLoadC = @upLoadC + 1
##
##            if not prevData?
##              prevData = []
##              start = 1
##            else
##              start += 1
##
##            req.open("POST", appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw", true)
##            req.setRequestHeader("Cache-Control", "no-cache")
##            req.setRequestHeader("X-Requested-With", "XMLHttpRequest")
##            req.setRequestHeader("Content-Type", "text/x-log;")
##            req.setRequestHeader("Content-Disposition", "attachment; filename=\"#{fileName}\"")
##            if (window.csrfToken)
##              req.setRequestHeader("X-Zimbra-Csrf-Token", window.csrfToken)
##
##    #        curView._startUploadAttachment()
##            curView._attButton.setEnabled(false);
##            controller._uploadingProgress = true;
##
##            # DBG.println(AjxDebug.DBG1,"Uploading file: "  + fileName + " file type" + (file.type || "application/octet-stream") );
##            @_uploadAttReq = req
##            if AjxEnv.supportsHTML5File
##              req.upload.addEventListener(
##                "progress"
##                do (curView) ->
##                  (evt) ->
##                    curView._uploadFileProgress(evt)
##                false
##              )
##            else
##              progress = (obj) ->
##                viewObj = obj
##                viewObj.si = window.setInterval(
##                  do (viewObj) ->
##                    () -> viewObj._progress()
##                  500
##                )
##              progress(curView)
##
##            params = {
##              allResponses: prevData,
##              start: start,
##              files: [file],
##              totalSize: file.size,
##              uploadedSize: 0
##            }
##            req.onreadystatechange = @_handleUploadResponse.bind(@, req, fileName, params)
##            req.send(file)
##          catch exp
##            # DBG.println("Error while uploading file: "  + fileName);
##            # DBG.println("Exception: "  + exp);
##            appCtxt._composeView._resetUpload(true)
##            msgDlg = appCtxt.getMsgDialog()
##            @upLoadC = @upLoadC - 1
##            msgDlg.setMessage(ZmMsg.importErrorUpload, DwtMessageDialog.CRITICAL_STYLE)
##            msgDlg.popup()
##            return false
##    #    uploadFcn.call(composeController, @appCtxt, fileName, logData)

      ###*
        Reset connection with new register session.
      ###

      _resetConnection: () ->
        @client.shutdown()
        @client.registerSession()
        @popdown()
        
      getTabKeys: () ->
        toReturn = []
        toReturn.push(name) for own name of @_tabIds
        toReturn

      @getDialog: (appCtxt, shell, client, sessionInfoProvider, preferenceManager, timedCallbackFactory, dateProvider) ->
        if not SettingsDialog._dialog?
          SettingsDialog._dialog = new SettingsDialog(appCtxt, shell, client, sessionInfoProvider, preferenceManager, timedCallbackFactory, dateProvider)
        SettingsDialog._dialog._hideDebugTab()
        SettingsDialog._dialog.debugInfoCheckbox.setSelected(false)
        SettingsDialog._dialog.errorTextarea.setValue(ZmMsg.loading)
        SettingsDialog._dialog

      popdown: () ->
        super()
        @_onPopdownSwitchToFirstTabCallback.run()

    exports.SettingsDialog = SettingsDialog
    return
)
