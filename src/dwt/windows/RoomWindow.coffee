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
    "require"
    "exports"
    '../../libext/bowser'
    '../../lib/log/LogEngine'
    '../../lib/callbacks/CallbackManager'
    '../../lib/callbacks/Callback'
    '../../lib/StringUtils'
    '../../lib/ZimbraUtils'
    '../../lib/LearningClipUtils'
    '../../zimbra/ajax/events/AjxListener'
    '../../zimbra/ajax/dwt/core/Dwt'
    '../../zimbra/ajax/dwt/widgets/DwtComposite'
    '../../zimbra/ajax/dwt/core/DwtDraggable'
    '../../zimbra/ajax/dwt/events/DwtEvent'
    '../../zimbra/ajax/dwt/widgets/DwtInputField'
    '../../zimbra/ajax/dwt/events/DwtKeyEvent'
    '../../zimbra/ajax/dwt/widgets/DwtToolBar'
    '../../zimbra/ajax/dwt/events/DwtUiEvent'
    './WindowBase'
    '../widgets/Conversation'
    '../widgets/LoadingDots'
    '../widgets/emoji/EmojiOnePickerButton'
    './RoomWindowMenuButton'
    '../../client/Room'
    '../../client/events/chat/WritingStatusEvent'
    '../../jquery/TextCompletePlugin'
  ],
  (
    require
    exports
    Bowser_1
    LogEngine_1
    CallbackManager_1
    Callback_1
    StringUtils_1
    ZimbraUtils_1
    LearningClipUtils_1
    AjxListener_1
    Dwt_1
    DwtComposite_1
    DwtDraggable_1
    DwtEvent_1
    DwtInputField_1
    DwtKeyEvent_1
    DwtToolBar_1
    DwtUiEvent_1
    WindowBase_1
    Conversation_1
    LoadingDots_1
    EmojiOnePickerButton_1
    RoomWindowMenuButton_1
    Room_1
    WritingStatusEvent_1
    TextCompletePlugin_1
  ) ->
    "use strict"

    Bowser = Bowser_1.Bowser
    AjxListener = AjxListener_1.AjxListener
    Dwt = Dwt_1.Dwt
    DwtComposite = DwtComposite_1.DwtComposite
    DwtDraggable = DwtDraggable_1.DwtDraggable
    DwtEvent = DwtEvent_1.DwtEvent
    DwtInputField = DwtInputField_1.DwtInputField
    DwtKeyEvent = DwtKeyEvent_1.DwtKeyEvent
    DwtToolBar = DwtToolBar_1.DwtToolBar
    DwtToolBarButton = DwtToolBar_1.DwtToolBarButton
    DwtUiEvent = DwtUiEvent_1.DwtUiEvent

    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)
    CallbackManager = CallbackManager_1.CallbackManager
    Callback = Callback_1.Callback
    StringUtils = StringUtils_1.StringUtils
    ZimbraUtils = ZimbraUtils_1.ZimbraUtils
    LearningClipUtils = LearningClipUtils_1.LearningClipUtils

    WindowBase = WindowBase_1.WindowBase
    Conversation = Conversation_1.Conversation
    LoadingDots = LoadingDots_1.LoadingDots
    EmojiOnePickerButton = EmojiOnePickerButton_1.EmojiOnePickerButton
    RoomWindowMenuButton = RoomWindowMenuButton_1.RoomWindowMenuButton
    Room = Room_1.Room
    WritingStatusEvent = WritingStatusEvent_1.WritingStatusEvent

    TextCompletePlugin = TextCompletePlugin_1.TextCompletePlugin

    class RoomWindow extends WindowBase

      @AddButtonPlugin = "Room Window Add Button"
      @BuddyStatusChangedPlugin = "Room Window Buddy Status Changed"

      @DEFAULT_ICON = "ImgZxChat_personalized_brand"

      @WIDTH  = 315
      @HEIGHT = 446

      @_SMOOTH_MOVE_DELAY = 800

      constructor: (
        shell
        appCtxt
        zimletContext
        timedCallbackFactory
        room
        roomManager
        notificationManager
        dateProvider
        sessionInfoProvider
        roomWindowPluginManager
      ) ->
        @appCtxt = appCtxt
        @zimletContext = zimletContext
        @mTimedCallbackFactory = timedCallbackFactory
        @mSessionInfoProvider = sessionInfoProvider
        @room = room
        @roomManager = roomManager
        @notificationManager = notificationManager
        @dateProvider = dateProvider
        @mRoomWindowPluginManager = roomWindowPluginManager
        @mRoomWindowPluginManager.switchOn(@)
        @callWindow = null
        @onMessageReceivedCallbacks = new CallbackManager()
        @onWindowOpenedCallbacks = new CallbackManager()
        @onWindowClosedCallbacks = new CallbackManager()
        @onStartDragCallbacks = new CallbackManager()
        @onDuringDragCallbacks = new CallbackManager()
        @onDragEndCallbacks = new CallbackManager()
        @_writingTimerCallback = null
        @mBuddyWritingStatuses = {}
        super(
          shell
          "ZxChat_RoomWindow"
          "#{@room.getRoomStatus().getCSS()}"
          "Chat"
          []
          undefined
          false
        )
        @containerView = new DwtComposite({parent: @})
        @mTitlebar = new DwtToolBar({
          parent: @containerView,
          parentElement: @_titleBarEl,
          className: "ZxChat_TitleBar_Toolbar"
        })
        @mTitlebar.addListener(DwtEvent.ONCLICK, new AjxListener(@, @onTitleBarClick))
        @mTitlebar.setSize(
          "#{RoomWindow.WIDTH}px"
          Dwt.DEFAULT
        )
        @mTitleLbl = new DwtLabel({
          parent: @mTitlebar
          className: "WindowBaseTitleBar#{ if !ZimbraUtils.isUniversalUI() then '-legacy-ui' else '' }"
        })
        # TODO: Dirty hack to modify the title label classname
        document.getElementById(@mTitleLbl.getHTMLElId() + "_title").className += " RoomWindowTitleBar-TitleLabel"
        @mTitleLbl.getHtmlElement()
        @mTitleLbl.addListener(DwtEvent.ONCLICK, new AjxListener(@, @onTitleBarClick))
        @setTitle(room.getTitle())
        @setIcon("#{@room.getRoomStatus().getCSS()}")
        @mTitlebar.addFiller()
        @mainMenuButton = new RoomWindowMenuButton(@, @mTitlebar, @mRoomWindowPluginManager)
        @mCloseButton = new DwtToolBarButton({
          parent: @mTitlebar
          className: "ZToolbarButton ZxChat_Button ZxChat_TitleBar_Button"
        })
        if ZimbraUtils.isUniversalUI()
          @mCloseButton.setImage("Close")
        else
          @mCloseButton.setImage("ZxChat_close")
        @mCloseButton.addSelectionListener(new AjxListener(@, @closeCallback))
        @conversation = new Conversation(@containerView, @dateProvider, @mTimedCallbackFactory)
        @mWritingStatusDots = new LoadingDots(@containerView, { dots: 5 })
        @room.onAddMessageReceived(new Callback(@, @_onAddMessageReceived))
        @room.onBuddyWritingStatus(new Callback(@, @_onBuddyWritingStatus))
        @room.onRoomStatusChange(new Callback(@, @_onRoomStatusChange))
        @room.onAddMessageSent(new Callback(@, @_onAddMessageSent))
        @room.onAddMessageSentFromAnotherSession(new Callback(@, @_onAddMessageSentFromAnotherSession))
        @room.onBuddyStatusChange(new Callback(@, @_onBuddyStatusChange))
        @room.onMemberRemoved(new Callback(@, @_onMemberRemoved))
        @room.onTitleChange(new Callback(@, @setTitle))
        @room.onTriggeredPopup(new Callback(@, @popup))
        @_lastPopup = 0

        inputToolbar = new DwtToolBar({parent: @containerView, className: "ZxChat_RoomToolbar"})

        @inputField = new DwtInputField({
          parent: inputToolbar
          className: "DwtInputField RoomWindowConversationInput"
          hint: StringUtils.getMessage("type_a_message")
          forceMultiRow: true
          rows: 1
        })
        TextCompletePlugin.installOnTextField(@inputField.getInputElement())
        inputToolbar.addFiller()
        @emoticonBtn = new EmojiOnePickerButton(
          { parent: inputToolbar }
          new Callback(this, this.onEmojiSelected)
          true
        )
        @inputField.addListener(
          DwtEvent.ONKEYUP
          new AjxListener(@, @_keyboardListener)
        )
        @inputField.addListener(
          DwtEvent.ONMOUSEMOVE
          new AjxListener(@, @stopBlink)
        )
        # O_o WAT?
#        dropTarget = new DwtDropTarget('BuddyTreeItem')
#        dropTarget.addDropListener(new AjxListener(@, @_dropListener))
#        @inputField.setDropTarget(dropTarget)
#        @containerView.setSize(
#          "#{RoomWindow.WIDTH}px"
#          "#{RoomWindow.HEIGHT - inputToolbar.getSize().y - @mTitlebar.getSize().y}px"
#        )
        @conversation.setSize(
          Dwt.DEFAULT
          "#{RoomWindow.HEIGHT - inputToolbar.getSize().y - @mTitlebar.getSize().y - @mWritingStatusDots.getSize().y}px"
        )
        @inputField.setSize(
          "#{RoomWindow.WIDTH - 80}px" # @emoticonBtn.getSize().x
          Dwt.DEFAULT
        )
        @setView(@containerView)
        @_timeoutWrittenStatus = 5000

      ###*
        Get the room id
        @return {string}
      ###
      getId: () ->
        @room.getId()

      setTitle: (title) ->
        if title.length > 25
          @mTitleLbl.setToolTipContent(title)
          title = LearningClipUtils.clip(title, WindowBase.MAX_TITLE_LENGTH, "DwtDialogTitle ZxChatWindowTitle")
        @mTitleLbl.setText(title)

      setIcon: (icon) ->
        @mTitleLbl.setImage(icon)

      _createHtmlFromTemplate: (templateId, data) ->
        data.doNotRenderTitleBar = true
        super(templateId, data)

      getPluginManager: () ->
        @mRoomWindowPluginManager

      ###*
        Insert an arbitrary text inside the input field of the window
        @param {string} newText
      ###
      addTextToInput: (newText) ->
        position = @_getCurrentInputPosition(@inputField.getInputElement())
        currentValue = @inputField.getValue()
        pre = currentValue.slice(0, position)
        pre = if pre != "" then "#{pre} " else ""
        post = currentValue.slice(position)
#        post = if post != "" then " #{post}" else ""
        newValue = "#{pre}#{newText} #{post}"
        @inputField.setValue(newValue)
        @inputField.focus()
        @inputField.moveCursorToEnd()

      ###*
        Get the conversation container
        @return {DwtComposite}
      ###
      getConversationContainer: () ->
        @containerView

      ###*
        Get the conversation object of the room window.
        @return {dwt.Conversation}
      ###
      getConversation: () ->
        @conversation

      ###*
        Add the focus to the input field of the window.
      ###
      focus: () ->
        @inputField.focus()

      ###*
        Keyboard listener for input element.
        @param {} ev
      ###
      _keyboardListener: (ev) ->
        @stopBlink()
        event = new DwtKeyEvent()
        event.setFromDhtmlEvent(DwtUiEvent.getEvent(ev))

        writingValue = WritingStatusEvent.RESET

        if DwtKeyEvent.getCharCode(event) == DwtKeyEvent.KEY_ENTER and not event.shiftKey
          cret = @_getCurrentInputPosition(@inputField.getInputElement())
          realMessage = @inputField.getValue()
          message = realMessage
          if Bowser.msie? and Bowser.msie
            # Fix for IE... i really hate IE
            message = "#{realMessage.substring(0, cret)}#{realMessage.substring(cret + 2)}"
          else
            message = "#{realMessage.substring(0, cret - 1)}#{realMessage.substring(cret)}"

          message = StringUtils.trim(message)
          @inputField.clear()
          if message.length > 0
            @room.sendMessage(message)
            if (@_writingTimerCallback?)
              @_writingTimerCallback.stop()
              @_writingTimerCallback = null
        else if StringUtils.trim(@inputField.getValue()).length > 0
          writingValue = WritingStatusEvent.WRITING
          if not @_writingTimerCallback?
            @room.sendWritingStatus(writingValue)
            @_writingTimerCallback = @mTimedCallbackFactory.createTimedCallback(
              new Callback(
                @,
                @_onWritingStatusTimeout
              ),
              @_timeoutWrittenStatus
            )
            @_writingTimerCallback.start()
          @_restartTimerCallbackOnTimeout = true
        else if not @_writingTimerCallback? and (DwtKeyEvent.KEY_DELETE or DwtKeyEvent.KEY_BACKSPACE)
          @room.sendWritingStatus(writingValue)
        return false

      _onWritingStatusTimeout: () ->
        if @_restartTimerCallbackOnTimeout
          @_writingTimerCallback.stop()
          @_writingTimerCallback.start()
          @_restartTimerCallbackOnTimeout = false
        else
          if StringUtils.trim(@inputField.getValue()).length > 0
            @room.sendWritingStatus(WritingStatusEvent.WRITTEN)
          else
            @room.sendWritingStatus(WritingStatusEvent.RESET)
          @_writingTimerCallback = null

      _onAddMessageReceived: (message) ->
        if not @isPoppedUp() and @getChildren().length > 0
          # The getChildren is necessary to detect if the conversation was detached from the window.
          # Maybe was attached to another parent.
          @popup()
        @onMessageReceivedCallbacks.run(@, message)
        @conversation.addMessageReceived(message)

      _onBuddyWritingStatus: (writingStatus) ->
        @mBuddyWritingStatuses[writingStatus.getSender().getId()] = writingStatus
        @_updateWritingDots(writingStatus.getValue())

      popup: (point) ->
        date = @dateProvider.getNow()
        @_lastPopup = date.getTime()
        super(point)
        @onWindowOpenedCallbacks.run(@, point)
        undefined

      popdown: () ->
        super()
        @onWindowClosedCallbacks.run(@)
        undefined

      onMessageReceived: (callback) ->
        @onMessageReceivedCallbacks.addCallback(callback)

      onWindowOpened: (callback) ->
        @onWindowOpenedCallbacks.addCallback(callback)

      onWindowClosed: (callback) ->
        @onWindowClosedCallbacks.addCallback(callback)

      _dragStart: (position) ->
        # You can drag the window only in horizontally! :D Have fun
        @_currSize = @getSize()
        DwtDraggable.setDragBoundaries(
          DwtDraggable.dragEl
          0
          document.body.offsetWidth - @_currSize.x
          document.body.offsetHeight - @_currSize.y
          document.body.offsetHeight - @_currSize.y
        )
        @onStartDragCallbacks.run(@, position)

      onStartDrag: (callback) ->
        @onStartDragCallbacks.addCallback(callback)

      onDuringDrag: (callback) ->
        @onDuringDragCallbacks.addCallback(callback)

      onDragEnd: (callback) ->
        @onDragEndCallbacks.addCallback(callback)

      _duringDrag: (position) ->
        super(position)
        @onDuringDragCallbacks.run(@, position)

      _dragEnd: (position) ->
        super(position)
        @onDragEndCallbacks.run(@, position)

      ###*
        Handle the "Send" button
        @private
      ###
      _sendButtonHandler: () ->
        message = StringUtils.trim(@inputField.getValue())
        @inputField.clear()
        if message.length > 0
          @room.sendMessage(message)

      ###*
        Get current selection position inside an HTMLElement.
        Can be used: Client, Admin
        @param {HTMLElement} el
        @return {number}
        @private
      ###
      _getCurrentInputPosition: (inputElement) ->
        caretOffset = 0
        doc = inputElement.ownerDocument or inputElement.document
        win = doc.defaultView or doc.parentWindow
        if inputElement.selectionStart?
          # Firefox Support
          caretOffset = inputElement.selectionStart
        else if win.getSelection?
          range = win.getSelection().getRangeAt(0)
          preCaretRange = range.cloneRange()
          preCaretRange.selectNodeContents(inputElement)
          preCaretRange.setEnd(range.endContainer, range.endOffset)
          caretOffset = preCaretRange.toString().length
        else if ((sel = doc.selection) && sel.type != 'Control')
          textRange = sel.createRange()
          preCaretTextRange = doc.body.createTextRange()
          preCaretTextRange.moveToElementText(inputElement)
          preCaretTextRange.setEndPoint('EndToEnd', textRange)
          caretOffset = preCaretTextRange.text.length
        caretOffset

      ###*
        Handle the remove of a member
        @param {Buddy} buddy
      ###
      _onMemberRemoved: (buddy) ->
#        Commented because of ZXCHAT-498 which relates to ZXCHAT-450.
#          While doing a register session the reset of the buddy list results in closing all the room windows.
#        if @room.getMembers().length < 1 then @popdown()

      ###*
        @param {DwtDropEvent} ev
      ###
      _dropListener: (ev) ->
        Log.debug(ev, "Something dropped on the room window")

      ###*
        Callback invoked when a buddy change its status
        @param {Date} date
        @param {Buddy} buddy
        @param {BuddyStatus} status
        @private
      ###
      _onBuddyStatusChange: (buddy, status) ->
        @conversation.addMessageStatus(buddy, status)
        @mRoomWindowPluginManager.triggerPlugins(RoomWindow.BuddyStatusChangedPlugin, status)

      ###*
        Callback function used to update the room status
        @param {BuddyStatus} status
        @private
      ###
      _onRoomStatusChange: (status) ->
        css = status.getCSS()
        @setIcon(css)

      ###*
        Get if the window (o one of his children has the focus)
        @return {boolean}
      ###
      _isFocused: () ->
        RoomWindow._recursiveFocus.call(@containerView) or RoomWindow._recursiveFocus.call(@)

      ###*
        Search for the focus on an object and his children.
        @return {boolean}
        @private
        @static
      ###
      @_recursiveFocus: () ->
        if @hasFocus? and @hasFocus() then return true
        else
          if @getChildren?
            for child in @getChildren()
              hasFocus = RoomWindow._recursiveFocus.call(child)
              if hasFocus then return true
        return false

      ###*
        @return {number}
      ###
      getLastRoomActivity: () ->
        if @_lastPopup > @room.getLastActivity()
          @_lastPopup
        else
          @room.getLastActivity()

      ###*
        Handle a message sent from this session.
        @param {MessageSent} message
        @private
      ###
      _onAddMessageSent: (message) ->
        @conversation.addMessageSent(message)

      ###*
        Handle a message sent from another session.
        @param {MessageSent} message
        @private
      ###
      _onAddMessageSentFromAnotherSession: (message) ->
        @conversation.addMessageSent(message)

      ###*
        @param {DwtSelectionEvent} ev
        @param {string} emoji
        @private
      ###
      onEmojiSelected: (ev, emoji) ->
        @addTextToInput(emoji)

      getOriginalZIndex: () ->
        WindowBase.Z_INDEX

      _updateWritingDots: (writingStatusValue) ->
        if writingStatusValue is WritingStatusEvent.WRITING
          @mWritingStatusDots.start()
        else
          @mWritingStatusDots.stop()

    exports.RoomWindow = RoomWindow
    return
)
