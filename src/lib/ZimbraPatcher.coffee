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
    '../libext/bowser',
    '../lib/Version',
    '../zimbra/ajax/dwt/core/Dwt',
    '../zimbra/ajax/dwt/events/DwtEvent',
    '../zimbra/ajax/dwt/events/DwtFocusEvent',
    '../zimbra/ajax/dwt/widgets/DwtControl',
    '../zimbra/ajax/dwt/widgets/DwtInputField',
    '../zimbra/ajax/dwt/widgets/DwtShell'
  ],
  (
    require,
    exports,
    Bowser_1,
    Version_1,
    Dwt_1,
    DwtEvent_1,
    DwtFocusEvent_1,
    DwtControl_1,
    DwtInputField_1
    DwtShell_1
  ) ->
    "use strict"

    Bowser = Bowser_1.Bowser
    Version = Version_1.Version
    Dwt = Dwt_1.Dwt
    DwtEvent = DwtEvent_1.DwtEvent
    DwtFocusEvent = DwtFocusEvent_1.DwtFocusEvent
    DwtControl = DwtControl_1.DwtControl
    DwtInputField = DwtInputField_1.DwtInputField
    DwtShell = DwtShell_1.DwtShell


    class ZimbraPatcher

      @patch: () ->
        # Fix FOCUS - BLUR Handling for Zimbra < 8.5 (Function backported)
        if not Version.isZ8_5Up('8.5.0')
          if DwtControl? and DwtControl.prototype.__doBlur?
            DwtControl.prototype.__doBlur = () ->
              @_hasFocus = false
              if @isListenerRegistered(DwtEvent.ONBLUR)
                focusEvent = DwtShell.focusEvent
                focusEvent.dwtObj = @
                focusEvent.state = DwtFocusEvent.BLUR
                mouseEvent = DwtShell.mouseEvent
                @notifyListeners(DwtEvent.ONBLUR, mouseEvent)
              @_blur()
            DwtControl.prototype.__doFocus = () ->
              @_hasFocus = true
              if @isListenerRegistered(DwtEvent.ONFOCUS)
                focusEvent = DwtShell.focusEvent
                focusEvent.dwtObj = @
                focusEvent.state = DwtFocusEvent.FOCUS
                mouseEvent = DwtShell.mouseEvent
                @notifyListeners(DwtEvent.ONFOCUS, mouseEvent)
              @_focus()

        if AjxUtil? and not AjxUtil.FULL_URL_RE?
          AjxUtil.FULL_URL_RE =
            /^[A-Za-z0-9]{2,}:\/\/[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*(:([0-9])+)?(\/[\w\.\|\^\*\[\]\{\}\(\)\-<>~,'#_;@:!%]+)*(\/)?(\?[\w\.\|\^\*\+\[\]\{\}\(\)\-<>~,'#_;@:!%&=]*)?$/

        if Dwt? and not Dwt.moveCursorToEnd?
          Dwt.moveCursorToEnd = (input) ->
            if Bowser.msie
              tr = input.createTextRange()
              tr.moveStart('character', input.value.length)
              tr.collapse()
              tr.select()
            else
              input.focus()
              length = input.value.length
              input.setSelectionRange(length, length)

        if DwtInputField? and not DwtInputField.prototype.moveCursorToEnd?
          DwtInputField.prototype.moveCursorToEnd = () ->
            Dwt.moveCursorToEnd(@_inputField)

    exports.ZimbraPatcher = ZimbraPatcher
    return
)