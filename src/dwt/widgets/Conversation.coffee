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
    '../../zimbra/ajax/dwt/core/Dwt'
    '../../zimbra/ajax/dwt/widgets/DwtComposite'
    './MessageReceived'
    './MessageSent'
    './MessageStatus'
    './MessageNotification'
  ],
  (
    require,
    exports
    Dwt_1,
    DwtComposite_1,
    MessageReceived_1,
    MessageSent_1,
    MessageStatus_1,
    MessageNotification_1
  ) ->
    "use strict"
    
    Dwt = Dwt_1.Dwt
    DwtComposite = DwtComposite_1.DwtComposite
    MessageReceived = MessageReceived_1.MessageReceived
    MessageSent = MessageSent_1.MessageSent
    MessageStatus = MessageStatus_1.MessageStatus
    MessageNotification = MessageNotification_1.MessageNotification

    class Conversation extends DwtComposite

      constructor: (parent, appCtxt, dateProvider, timedCallbackFactory) ->
        @appCtxt = appCtxt
        @dateProvider = dateProvider
        @timedCallbackFactory = timedCallbackFactory
        @_lastBuddyStatusMessages = {}
#        @_lastBuddyStatusWriting = [] # [{buddyId:, status:}]
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

      addMessageStatus: (buddy, buddyStatus, offlineMessage) ->
        lastMessageStatus = @_lastBuddyStatusMessages[buddy.getId()]
        if lastMessageStatus?
          lastMessageStatus.setVisible(false)
        @_lastBuddyStatusMessages[buddy.getId()] = new MessageStatus(@, buddy, buddyStatus, offlineMessage, @dateProvider)
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

#      ###*
#        Add a writing status to the conversation
#        @param {client/MessageWritingStatus} writingStatus
#      ###
#      addWritingStatus: (writingStatus) ->
#        buddyId = writingStatus.getSender().getId()
#        lastWritingStatusElement = @_getLastBuddyStatusWriting(buddyId)
#        if lastWritingStatusElement?
#          lastWritingStatusElement.setVisible(false)
#          # new widgets/MessageWritingStatus
#        if writingStatus.getValue() != WritingStatusEvent.RESET
#          statusElement = new MessageWritingStatus(@, writingStatus, @dateProvider)
#          @_setLastBuddyStatusWriting(buddyId, statusElement)
#          if writingStatus.getValue() == WritingStatusEvent.WRITTEN
#            @timedCallbackFactory.createTimedCallback(
#              new Callback(
#                statusElement
#                statusElement.setVisible
#                false
#              )
#              MessageWritingStatus.TIMEOUT
#            ).start()
#        @scrollToTop()
#
#      _setLastBuddyStatusWriting: (buddyId, status) ->
#        statusElement = @_getLastBuddyStatusWriting(buddyId)
#        if statusElement?
#          for buddyId_Status in @_lastBuddyStatusWriting
#            if buddyId_Status.buddyId == buddyId
#              buddyId_Status.status = status
#        else
#          @_lastBuddyStatusWriting.push({buddyId: buddyId, status: status})
#
#      _getLastBuddyStatusWriting: (buddyId) ->
#        for buddyId_Status in @_lastBuddyStatusWriting
#          if buddyId_Status.buddyId == buddyId
#            return buddyId_Status.status
#        return null

      ###*
        Scroll the conversation to top
      ###
      scrollToTop: () ->
        @getHtmlElement().scrollTop = @getHtmlElement().scrollHeight

    exports.Conversation = Conversation
    return
)