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
    '../../lib/callbacks/CallbackManager',
    '../../lib/StringUtils',
    '../../lib/Version',
    '../../zimbra/ajax/dwt/core/Dwt',
    '../../zimbra/ajax/dwt/events/DwtEvent',
    '../../zimbra/ajax/dwt/events/DwtKeyEvent',
    '../../zimbra/ajax/dwt/events/DwtMouseEvent',
    '../../zimbra/ajax/dwt/widgets/DwtInputField',
  ],
  (
    require,
    exports,
    Callback_1,
    CallbackManager_1,
    StringUtils_1,
    Version_1,
    Dwt_1,
    DwtEvent_1,
    DwtKeyEvent_1,
    DwtMouseEvent_1,
    DwtInputField_1
  ) ->
    "use strict"
    
    Callback = Callback_1.Callback
    CallbackManager = CallbackManager_1.CallbackManager
    StringUtils = StringUtils_1.StringUtils
    Version = Version_1.Version

    Dwt = Dwt_1.Dwt
    DwtEvent = DwtEvent_1.DwtEvent
    DwtKeyEvent = DwtKeyEvent_1.DwtKeyEvent
    DwtMouseEvent = DwtMouseEvent_1.DwtMouseEvent
    DwtInputField = DwtInputField_1.DwtInputField

    class SearchInputField extends DwtInputField

      constructor: (parent) ->
        super({ parent: parent })
        @_onChangeCbkMgr = new CallbackManager()
        @setHint(ZmMsg.search or "Search")
        @getInputElement().setAttribute('class', 'ZxSearchInputField')
        @setHandler(DwtEvent.ONKEYUP, (new Callback(@, @_handleKeyUp)).toClosure())
        @setHandler(DwtEvent.ONCLICK, (new Callback(@, @_handleClick)).toClosure())
        @setHandler(DwtEvent.ONMOUSEMOVE, (new Callback(@, @_handleMove)).toClosure())
        if parent.getBounds()?
          deltaToRemoveFromWidth = 2
          if Version.isZ8_5Up()
            deltaToRemoveFromWidth = 10
          @setSize(
            "#{parent.getBounds().width - deltaToRemoveFromWidth}px",
            null
          )

      ###*
        Overrides the @see DwtControl.setSize function.
        This version of the function consider to set the size also of the real input element.
        @param {string|number} width
        @param {string|number} height
      ###
      setSize: (width, height) ->
        super(width, height)
        if @getInputElement()? and width? and width != Dwt.CLEAR
          @getInputElement().style.width = width
        if @getInputElement()? and height? and height != Dwt.CLEAR
          @getInputElement().style.height = height


      ###*
        Handle a text change on the input element.
        @param {DwtMouseEvent|DwtKeyEvent} ev
        @private
      ###
      _handleChange: (ev) ->
        value = StringUtils.trim(@getValue())
        if value is ""
          @getInputElement().setAttribute('class', 'ZxSearchInputField')
        else
          @getInputElement().setAttribute('class', 'ZxSearchInputField-dirty')

        @_onChangeCbkMgr.run(value, ev)

      ###*
        Handle a key up on the input element.
        If is pressed the area of the reset icon (last 16 pixels), clean the input field.
        @param {DwtKeyEvent} ev
        @private
      ###
      _handleKeyUp: (ev) ->
        keyEvent = new DwtKeyEvent()
        keyEvent.setFromDhtmlEvent(ev, @)
        @_handleChange(keyEvent)

      ###*
        Handle a click on the input element.
        If is pressed the area of the reset icon (last 16 pixels), clean the input field.
        @param {DwtMouseEvent} ev
        @private
      ###
      _handleClick: (ev) ->
        clickEvent = new DwtMouseEvent()
        clickEvent.setFromDhtmlEvent(ev, @)
        bounds = Dwt.getBounds(@getInputElement())
        if not bounds? then return
        width = bounds.width
        clickPosition = clickEvent.elementX
        isInsideCleanIcon = if (width - clickPosition) < 16 then true else false
        if isInsideCleanIcon and @getValue() != ""
          @clear()
          @blur()
          @_handleChange(clickEvent)

      ###*
       Handle a mouse move on the input element.
       @param {DwtMouseEvent} ev
       @private
      ###
      _handleMove: (ev) ->
        moveEvent = new DwtMouseEvent()
        moveEvent.setFromDhtmlEvent(ev, @)
        width = @getBounds().width
        xPosition = moveEvent.elementX
        isInsideCleanIcon = if (width - xPosition) < 16 then true else false
        if isInsideCleanIcon and @getValue() != ""
          if @getCursor() != "pointer"
            @setCursor("pointer")
            @getInputElement().setAttribute("style", "width: " + width + "px; cursor: pointer;")
        else
          if @getCursor() != "text"
            @setCursor("text")
            @getInputElement().setAttribute("style", "width: " + width + "px; cursor: text;")

      ###*
        Register a function which will be invoked on text change.
        @param {Callback} fcn
      ###
      onChange: (callback) ->
        @_onChangeCbkMgr.addCallback(callback)

    exports.SearchInputField = SearchInputField
    return
)
