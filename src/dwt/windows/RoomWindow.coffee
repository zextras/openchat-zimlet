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
    '../../lib/Version'
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
    '../widgets/emoji/EmojiOnePickerButton'
    './RoomWindowMenuButton'
    '../widgets/MessageWritingStatus'
    '../../client/Room'
    '../../client/events/chat/WritingStatusEvent'
    '../../client/events/chat/LeftConversationEvent'
  ],
  (
    require
    exports
    Bowser_1
    LogEngine_1
    CallbackManager_1
    Callback_1
    StringUtils_1
    Version_1
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
    EmojiOnePickerButton_1
    RoomWindowMenuButton_1
    MessageWritingStatus_1
    Room_1
    WritingStatusEvent_1
    LeftConversationEvent_1
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
    Version = Version_1.Version

    WindowBase = WindowBase_1.WindowBase
    Conversation = Conversation_1.Conversation
    EmojiOnePickerButton = EmojiOnePickerButton_1.EmojiOnePickerButton
    RoomWindowMenuButton = RoomWindowMenuButton_1.RoomWindowMenuButton
#    Reason = Reason_1.Reason
    Room = Room_1.Room
    WritingStatusEvent = WritingStatusEvent_1.WritingStatusEvent
    MessageWritingStatus = MessageWritingStatus_1.MessageWritingStatus
    LeftConversationEvent = LeftConversationEvent_1.LeftConversationEvent

    class RoomWindow extends WindowBase

      @AddButtonPlugin = "Room Window Add Button"
      @BuddyStatusChangedPlugin = "Room Window Buddy Status Changed"

      @DEFAULT_ICON = "ImgZxChat_personalized_brand"

      @WIDTH  = 210 * 1.25
      @HEIGHT = 340 * 1.25

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
        @_lastBuddyStatusMessages = {}
        @_lastBuddyStatusWriting = [] # [{buddyId:, status:}]
        super(
          shell
          "ZxChat_RoomWindow_#{room.getTitle()}"
          "Img#{@room.getRoomStatus().getCSS()}"
          "Chat"
          [
            WindowBase.BTN_MINIMIZE
            WindowBase.BTN_CLOSE
          ]
          undefined
          false
        )
        @setTitle(room.getTitle())
        @_titleEl.style.width = "195px"
        @mTitleWritingStatusEl.style.height = @_titleEl.offsetHeight * 0.8 + "px"
        @mTitleWritingStatusEl.style.fontSize = "0.8rem"
        @containerView = new DwtComposite({parent: @})
        @containerView.setSize(
          "#{RoomWindow.WIDTH - 2}px"
          "#{RoomWindow.HEIGHT - 26}px"
        )
        @conversation = new Conversation(@containerView, @appCtxt, @dateProvider, @mTimedCallbackFactory)
        @conversation.setSize(
          Dwt.DEFAULT
          "#{RoomWindow.HEIGHT - 118}px"
        )
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

#        separator1 = new DwtControl({parent: @containerView, className: "horizSep"})
#        separator1.getHtmlElement().style.marginTop = 0
        toolbar = new DwtToolBar({parent: @containerView, className: "ZxChat_Toolbar"})
#        separator2 = new DwtControl({parent: @containerView, className: "horizSep"})
#        separator2.getHtmlElement().style.marginBottom = 0

        @_populateToolbar(toolbar)
        @inputField = new DwtInputField({
          parent: @containerView
          className: "DwtInputField ZxChat_ConversationInput"
          forceMultiRow: true
          id: "ZxChat_ConversationInput_#{room.getTitle()}"
        })
        if Version.isZ8_5Up()
          @inputField.setSize("#{RoomWindow.WIDTH - 10}px", "55px")
          if @inputField.getInputElement()?
            @inputField.getInputElement().style.width = "#{RoomWindow.WIDTH - 10}px"
            @inputField.getInputElement().style.height = "55px"
        else
          @inputField.setSize("#{RoomWindow.WIDTH - 4}px", "46px")
          if @inputField.getInputElement()?
            @inputField.getInputElement().style.width = "#{RoomWindow.WIDTH - 4}px"
            @inputField.getInputElement().style.height = "46px"
        if @inputField.getInputElement()?
          @inputField.getInputElement().style.resize = "none"
          @inputField.getInputElement().style.borderStyle = "none"
        @inputField.addListener(
          DwtEvent.ONKEYUP
          new AjxListener(@, @_keyboardListener)
        )
        @inputField.addListener(
          DwtEvent.ONMOUSEMOVE
          new AjxListener(@, @stopBlink)
        )
    #    O_o WAT?
    #    dropTarget = new DwtDropTarget('BuddyTreeItem')
    #    dropTarget.addDropListener(new AjxListener(@, @_dropListener))
    #    @inputField.setDropTarget(dropTarget)
        @setView(@containerView)
        @setIcon("Img#{@room.getRoomStatus().getCSS()}")
        @mIconEl.parentElement.style.verticalAlign = "top"
        @_timeoutWrittenStatus = 5000

      ###*
        Get the room id
        @return {string}
      ###
      getId: () ->
        @room.getId()

      getPluginManager: () ->
        @mRoomWindowPluginManager
        
      _populateToolbar: (toolbar) ->
        # Emoticons can be converted to a plugin
        @emoticonBtn = new EmojiOnePickerButton(
          {parent: toolbar, id: "EmojiOneButton"}
          @zimletContext
          @mTimedCallbackFactory
          new Callback(this, this.onEmojiSelected)
          true
        )

        @mRoomWindowPluginManager.triggerPlugins(RoomWindow.AddButtonPlugin, toolbar)

        toolbar.addFiller()

        @mainMenuButton = new RoomWindowMenuButton(@, toolbar, @mRoomWindowPluginManager)
        sendBtn = new DwtToolBarButton({ parent: toolbar, className: "ZxChat_Button ZToolbarButton" })
        sendBtn.setImage("ZxChat_send-message")
        sendBtn.setToolTipContent(StringUtils.getMessage("send_tooltip"), false)
        sendBtn.addSelectionListener(new AjxListener(@, @_sendButtonHandler))

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
    #    post = if post != "" then " #{post}" else ""
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
#        buddyId = writingStatus.getSender().getId()
#        lastWritingStatusElement = @_getLastBuddyStatusWriting(buddyId)
#        if lastWritingStatusElement?
#          lastWritingStatusElement.setVisible(false)
#        if writingStatus.getValue() != WritingStatusEvent.RESET
#          statusElement = new MessageWritingStatus(@, writingStatus, @dateProvider)
#          @_setLastBuddyStatusWriting(buddyId, statusElement)
        @setWritingStatusInTitle(writingStatus.getValue())
        if writingStatus.getValue() == WritingStatusEvent.WRITTEN
          @mTimedCallbackFactory.createTimedCallback(
            new Callback(
              @
              @setWritingStatusInTitle
              WritingStatusEvent.RESET
            )
            MessageWritingStatus.TIMEOUT
          ).start()
#        @scrollToTop()
#        @conversation.addWritingStatus(writingStatus)

      _setLastBuddyStatusWriting: (buddyId, status) ->
        statusElement = @_getLastBuddyStatusWriting(buddyId)
        if statusElement?
          for buddyId_Status in @_lastBuddyStatusWriting
            if buddyId_Status.buddyId == buddyId
              buddyId_Status.status = status
        else
          @_lastBuddyStatusWriting.push({buddyId: buddyId, status: status})

      _getLastBuddyStatusWriting: (buddyId) ->
        for buddyId_Status in @_lastBuddyStatusWriting
          if buddyId_Status.buddyId == buddyId
            return buddyId_Status.status
        return null

      setWritingStatusInTitle: (writingStatusValue) ->
        switch writingStatusValue
          when WritingStatusEvent.WRITING
            message = StringUtils.getMessage("is_writing")
          when WritingStatusEvent.WRITTEN
            message = StringUtils.getMessage("has_written")
          when LeftConversationEvent.LEFT_CONVERSATION
            message = StringUtils.getMessage("buddy_has_left_the_conversation")
          else
  #        WritingStatusEvent.RESET
            message = ""
        @mTitleWritingStatusEl.innerText = message

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
        @conversation.addMessageStatus(buddy, status, @room.getOfflineMessage())
        @mRoomWindowPluginManager.triggerPlugins(RoomWindow.BuddyStatusChangedPlugin, status)

      ###*
        Callback function used to update the room status
        @param {BuddyStatus} status
        @private
      ###
      _onRoomStatusChange: (status) ->
        css = status.getCSS()
        @setIcon("Img#{css}")

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

    exports.RoomWindow = RoomWindow
    return
)
