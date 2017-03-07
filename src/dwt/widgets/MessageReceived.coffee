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
    './Message',
    '../../lib/callbacks/Callback'
  ],
  (
    require,
    exports,
    Message_1,
    Callback_1
  ) ->
    "use strict"

    Message = Message_1.Message
    Callback = Callback_1.Callback

    class MessageReceived extends Message

      constructor: (parent, message, dateProvider) ->
        super(parent, message, dateProvider)
        @getHtmlElement().childNodes[0].setAttribute("sender", false)
        buddy = message.getSender()
        buddy.onNicknameChange(new Callback(@, @_updateBuddyNickname))

      ###*
        Create the html element expanding the template
      ###
      _createHtml: () ->
        super({
          sender: @message.getSender().getNickname()
        })

      ###*
        Handle the nickname change of the sender.
        @param {string} nickname
      ###
      _updateBuddyNickname: (nickname) ->
        if @_senderEl?
          if @_senderEl.innerHTML?
            @_senderEl.innerHTML = nickname
          else if @_senderEl.innerText?
            @_senderEl.innerText = nickname


    exports.MessageReceived = MessageReceived
    return
)
