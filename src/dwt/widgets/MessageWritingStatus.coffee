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
    '../../lib/StringUtils',
    '../../zimbra/ajax/dwt/widgets/DwtComposite',
    './Message',
    '../../client/MessageReceived'
    '../../client/events/chat/WritingStatusEvent'
    '../../client/events/chat/LeftConversationEvent'
  ],
  (
    require,
    exports,
    StringUtils_1,
    DwtComposite_1,
    Message_1,
    MessageReceived_1,
    WritingStatusEvent_1,
    LeftConversationEvent_1
  ) ->
    "use strict"
    
    DwtComposite = DwtComposite_1.DwtComposite

    StringUtils = StringUtils_1.StringUtils

    Message = Message_1.Message
    MessageReceived = MessageReceived_1.MessageReceived
    WritingStatusEvent = WritingStatusEvent_1.WritingStatusEvent
    LeftConversationEvent = LeftConversationEvent_1.LeftConversationEvent

    class MessageWritingStatus extends Message

      @TIMEOUT = 15000 # 15s

      constructor: (parent, writingStatus, dateProvider) ->
        @writingStatus = writingStatus
        switch writingStatus.getValue()
          when WritingStatusEvent.WRITING
            message = StringUtils.getMessage("is_writing")
          when WritingStatusEvent.WRITTEN
            message = StringUtils.getMessage("has_written")
          when LeftConversationEvent.LEFT_CONVERSATION
            message = StringUtils.getMessage("buddy_has_left_the_conversation")
          else
    #        WritingStatusEvent.RESET
            message = ""

        super(
          parent
          new MessageReceived(
            writingStatus.getMessageId()
            writingStatus.getSender().getId()
            writingStatus.getDate()
            message
          )
          dateProvider
          "com_zextras_chat.Widgets#MessageWritingStatus"
        )

      ###*
        Create the html element expanding the template
      ###
      _createHtml: () ->
        data = {
          id: @_htmlElId + "_" + @writingStatus.getValue()
          buddy: @writingStatus.getSender().getNickname()
          message: @message.getMessage()
        }
        # Expand template
        DwtComposite.prototype._createHtmlFromTemplate.call(@, @TEMPLATE, data)

    exports.MessageWritingStatus = MessageWritingStatus
    return
)
