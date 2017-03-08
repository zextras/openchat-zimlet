#
# ***** BEGIN LICENSE BLOCK *****
# Copyright (C) 2011-2017 ZeXtras
#
# The contents of this file are subject to the ZeXtras EULA;
# you may not use this file except in compliance with the EULA.
# You may obtain a copy of the EULA at
# http://www.zextras.com/zextras-eula.html
# ***** END LICENSE BLOCK *****
#

define(
  [
    "require",
    "exports",
    '../../zimbra/ajax/dwt/core/Dwt'
    '../../zimbra/ajax/dwt/widgets/DwtComposite'
    './MessageReceived'
    './MessageSent'
    './MessageStatus'
    './MessageWritingStatus'
    './MessageNotification'
    '../../client/events/chat/WritingStatusEvent'
  ],
  (
    require
    exports
    Dwt_1
    DwtComposite_1
    MessageReceived_1
    MessageSent_1
    MessageStatus_1
    MessageWritingStatus_1
    MessageNotification_1
    WritingStatusEvent_1
  ) ->
    "use strict"

    Dwt = Dwt_1.Dwt
    DwtComposite = DwtComposite_1.DwtComposite
    MessageReceived = MessageReceived_1.MessageReceived
    MessageSent = MessageSent_1.MessageSent
    MessageStatus = MessageStatus_1.MessageStatus
    MessageWritingStatus = MessageWritingStatus_1.MessageWritingStatus
    MessageNotification = MessageNotification_1.MessageNotification
    WritingStatusEvent = WritingStatusEvent_1.WritingStatusEvent

    class Conversation extends DwtComposite

      constructor: (parent, appCtxt, dateProvider, timedCallbackFactory) ->
        @appCtxt = appCtxt
        @dateProvider = dateProvider
        @timedCallbackFactory = timedCallbackFactory
        @_lastBuddyStatusMessages = {}
        @_lastBuddyStatusWriting = [] # [{buddyId:, status:}]
        super({
          parent: parent
          className: "ZxChat_Conversation"
        })
        @setScrollStyle(Dwt.SCROLL_Y)
        @_setAllowSelection()

      addMessageReceived: (message) ->
        newMessage = new MessageReceived(@, message, @dateProvider)
        @scrollToTop()

      addMessageSent: (message) ->
        newMessage = new MessageSent(@, message, @dateProvider)
        for buddyId_Status in @_lastBuddyStatusWriting
          buddyId_Status.status.reparent(this)
        @scrollToTop()

      addMessageStatus: (buddy, buddyStatus) ->
        lastMessageStatus = @_lastBuddyStatusMessages[buddy.getId()]
        if lastMessageStatus?
          lastMessageStatus.setVisible(false)
        @_lastBuddyStatusMessages[buddy.getId()] = new MessageStatus(@, buddy, buddyStatus, @dateProvider)
        @scrollToTop()

      addMessageGroupInfo: (buddyId, buddyNickname, type) ->
        new MessageGroupChatInfo(@, buddyId, buddyNickname, type, @dateProvider)
        @scrollToTop()

      ###*
        Add a notification message to the conversation
        @param {Date} date
        @param {string} text
      ###
      addNotificationMessage: (text = "") ->
        message = new MessageNotification(@, text, @dateProvider)
        @scrollToTop()

      ###*
        Add a writing status to the conversation
        @param {client/MessageWritingStatus} writingStatus
      ###
      addWritingStatus: (writingStatus) ->
        buddyId = writingStatus.getSender().getId()
        @_removeAllWritingStatuses()
        if writingStatus.getValue() is WritingStatusEvent.WRITING
          @_setLastBuddyStatusWriting(buddyId, new MessageWritingStatus(@, writingStatus, @dateProvider))
        #        lastWritingStatusElement = @_getLastBuddyStatusWriting(buddyId)
        #        if lastWritingStatusElement?
        #          lastWritingStatusElement.setVisible(false)
        #          # new widgets/MessageWritingStatus
        #        if writingStatus.getValue() isnt WritingStatusEvent.RESET or writingStatus.getValue() isnt WritingStatusEvent.WRITTEN
        #          statusElement = new MessageWritingStatus(@, writingStatus, @dateProvider)
        #          @_setLastBuddyStatusWriting(buddyId, statusElement)
        #        else if writingStatus.getValue() is WritingStatusEvent.WRITTEN
        #            @timedCallbackFactory.createTimedCallback(
        #              new Callback(
        #                statusElement
        #                statusElement.setVisible
        #                false
        #              )
        #              MessageWritingStatus.TIMEOUT
        #            ).start()
        #        else
        #          lastWritingStatusElement.setVisible(false)
        @scrollToTop()

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

      _removeAllWritingStatuses: () ->
        for buddyId_Status in @_lastBuddyStatusWriting
          @removeChild(buddyId_Status.status)
        @_lastBuddyStatusWriting = []


      ###*
        Scroll the conversation to top
      ###
      scrollToTop: () ->
        @getHtmlElement().scrollTop = @getHtmlElement().scrollHeight

    exports.Conversation = Conversation
    return
)