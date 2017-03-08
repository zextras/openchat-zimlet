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
    '../../zimbra/ajax/dwt/widgets/DwtComposite'
    './Message'
    '../../client/MessageReceived'
  ],
  (
    require
    exports
    DwtComposite_1
    Message_1
    MessageReceived_1
  ) ->
    "use strict"

    DwtComposite = DwtComposite_1.DwtComposite
    Message = Message_1.Message
    MessageReceived = MessageReceived_1.MessageReceived

    class MessageStatus extends Message

      constructor: (parent, buddy, status, dateProvider) ->
        @date = dateProvider.getNow()
        @buddy = buddy
        @status = status
        super(
          parent
          new MessageReceived(
            ""
            buddy
            dateProvider.getNow()
            status.getMessage()
          )
          dateProvider
          "com_zextras_chat_open.Widgets#MessageStatus"
        )
        @_createHtml()
        @getHtmlElement().setAttribute("status", status.getMessageLabel())

      ###*
        Create the html element expanding the template
      ###
      _createHtml: () ->
        data = {
          id: @_htmlElId
          sender: @buddy.getNickname()
          content: @message.getMessage()
        }
        # Expand template
        DwtComposite.prototype._createHtmlFromTemplate.call(@, @TEMPLATE, data)
        # Remember elements
        @_senderEl = document.getElementById("#{data.id}_sender")
        @_contentEl = document.getElementById("#{data.id}_content")

    exports.MessageStatus = MessageStatus
    return
)
