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
    '../../client/MessageReceived',
    '../../client/BuddyStatusType'
  ],
  (
    require,
    exports,
    StringUtils_1,
    DwtComposite_1,
    Message_1,
    MessageReceived_1,
    BuddyStatusType_1
  ) ->
    "use strict"
    
    StringUtils = StringUtils_1.StringUtils

    DwtComposite = DwtComposite_1.DwtComposite
    Message = Message_1.Message
    MessageReceived = MessageReceived_1.MessageReceived
    BuddyStatusType = BuddyStatusType_1.BuddyStatusType

    class MessageStatus extends Message

      constructor: (parent, buddy, status, offlineMessage, dateProvider) ->
        @date = dateProvider.getNow()
        @buddy = buddy
        @status = status
        message = status.getMessage()
        if status.getType() in [BuddyStatusType.OFFLINE, BuddyStatusType.UNREACHABLE]
          message = offlineMessage
#          if isGroupChat
#            message = StringUtils.getMessage("user_left_conversation")
#          else
#            message = StringUtils.getMessage("user_offline_messages_will_be_delivered")
        super(
          parent
          new MessageReceived(
            ""
            buddy.getId()
            dateProvider.getNow()
            message
          )
          dateProvider
          "com_zextras_chat.Widgets#MessageStatus"
        )
        @getHtmlElement().setAttribute("status", status.getMessageLabel())

      ###*
        Create the html element expanding the template
      ###
      _createHtml: () ->
        data = {
          id: @_htmlElId
          buddy: @buddy.getNickname()
          date: StringUtils.localizeHour(@date, @dateProvider.getNow())
          dateTooltip: @formatDate(@date)
          content: @message.getMessage()
        }
        # Expand template
        DwtComposite.prototype._createHtmlFromTemplate.call(@, @TEMPLATE, data)
        # Remember elements
        @_senderEl = document.getElementById("#{data.id}_buddy")
        @_dateEl = document.getElementById("#{data.id}_date")
        @_contentEl = document.getElementById("#{data.id}_content")

    exports.MessageStatus = MessageStatus
    return
)
