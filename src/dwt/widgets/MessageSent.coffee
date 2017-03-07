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
    '../../lib/callbacks/Callback',
    '../../lib/StringUtils',
    './Message'
  ],
  (
    require,
    exports,
    Callback_1,
    StringUtils_1,
    Message_1
  ) ->
    "use strict"
    
    Callback = Callback_1.Callback
    StringUtils = StringUtils_1.StringUtils
    Message = Message_1.Message

    class MessageSent extends Message

      constructor: (parent, message, dateProvider) ->
        super(parent, message, dateProvider)
        @getHtmlElement().childNodes[0].setAttribute("sender", true)
        @message.onSetDelivered(new Callback(@, @setDelivered))
        @setDelivered(message.isDelivered())

      ###*
        Create the html element expanding the template
        @private
      ###
      _createHtml: () ->
        super({
          sender: StringUtils.getMessage("Me")
        })

      ###*
        Set the delivered status of the message
        @param {boolean=true} delivered
      ###
      setDelivered: (delivered = true) ->
        opacity = if delivered then 1 else 0.6
        if @getHtmlElement()?
          @getHtmlElement().style.opacity = opacity

    exports.MessageSent = MessageSent
    return
)
