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
    '../../lib/StringUtils'
    '../../zimbra/ajax/dwt/widgets/DwtComposite'
    './Message'
  ],
  (
    require,
    exports,
    StringUtils_1,
    DwtComposite_1,
    Message_1
  ) ->
    "use strict"
    
    StringUtils = StringUtils_1.StringUtils

    DwtComposite = DwtComposite_1.DwtComposite

    Message = Message_1.Message

    class MessageNotification extends Message

      @TYPE_ALERT = "alert"
      @TYPE_WARNING = "warning"
      @TYPE_MESSAGE = "message"

      constructor: (parent, message, dateProvider, type = MessageNotification.TYPE_MESSAGE) ->
        @date = dateProvider.getNow()
        @type = type
        super(
          parent
          message
          dateProvider
          "com_zextras_chat.Widgets#MessageNotification"
        )

      ###*
        Create the html element expanding the template
      ###
      _createHtml: () ->
        data = {
          id: @_htmlElId
          title: StringUtils.getMessage('jingle_call_msg_title')
          date: StringUtils.localizeHour(@date, @dateProvider.getNow())
          dateTooltip: @formatDate(@date)
          content: @message
        }
        # Expand template
        DwtComposite.prototype._createHtmlFromTemplate.call(@, @TEMPLATE, data)
        # Remember elements
        @_titleEl = document.getElementById("#{data.id}_title")
        @_dateEl = document.getElementById("#{data.id}_date")
        @_contentEl = document.getElementById("#{data.id}_content")

    exports.MessageNotification = MessageNotification
    return
)
