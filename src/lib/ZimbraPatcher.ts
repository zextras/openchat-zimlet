/*
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import {Version} from "./Version";
import {DwtControl} from "../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtEvent} from "../zimbra/ajax/dwt/events/DwtEvent";
import {DwtShell} from "../zimbra/ajax/dwt/widgets/DwtShell";
import {DwtFocusEvent} from "../zimbra/ajax/dwt/events/DwtFocusEvent";
import {DwtMouseEvent} from "../zimbra/ajax/dwt/events/DwtMouseEvent";
import {AjxUtil} from "../zimbra/ajax/util/AjxUtil";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {Bowser} from "../libext/bowser";
import {DwtInputField} from "../zimbra/ajax/dwt/widgets/DwtInputField";

export class ZimbraPatcher {

  public static patch() {
    // Fix FOCUS - BLUR Handling for Zimbra < 8.5 (Function backported)
    if (!Version.isZ8_5Up()) {
      if (typeof DwtControl !== "undefined" && DwtControl !== null && DwtControl.prototype.__doBlur) {
        DwtControl.prototype.__doBlur = function () {
          this._hasFocus = false;
          if (this.isListenerRegistered(DwtEvent.ONBLUR)) {
            let focusEvent: DwtFocusEvent = DwtShell.focusEvent;
            focusEvent.dwtObj = this;
            focusEvent.state = DwtFocusEvent.BLUR;
            let mouseEvent: DwtMouseEvent = DwtShell.mouseEvent;
            this.notifyListeners(DwtEvent.ONBLUR, mouseEvent);
          }
          this._blur();
        };
        DwtControl.prototype.__doFocus = function () {
          this._hasFocus = false;
          if (this.isListenerRegistered(DwtEvent.ONFOCUS)) {
            let focusEvent: DwtFocusEvent = DwtShell.focusEvent;
            focusEvent.dwtObj = this;
            focusEvent.state = DwtFocusEvent.FOCUS;
            let mouseEvent: DwtMouseEvent = DwtShell.mouseEvent;
            this.notifyListeners(DwtEvent.ONFOCUS, mouseEvent);
          }
          this._focus();
        };
      }
    }

    if (
      typeof AjxUtil !== "undefined" && AjxUtil !== null &&
      (typeof AjxUtil.FULL_URL_RE === "undefined" || AjxUtil.FULL_URL_RE === null)
    ) {
      AjxUtil.FULL_URL_RE =
        /^[A-Za-z0-9]{2,}:\/\/[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*(:([0-9])+)?(\/[\w\.\|\^\*\[\]\{\}\(\)\-<>~,'#_;@:!%]+)*(\/)?(\?[\w\.\|\^\*\+\[\]\{\}\(\)\-<>~,'#_;@:!%&=]*)?$/;
    }

    if (
      typeof Dwt !== "undefined" && Dwt !== null &&
      (typeof Dwt.moveCursorToEnd === "undefined" || Dwt.moveCursorToEnd === null)
    ) {
      Dwt.moveCursorToEnd = function (input: ExtendedHTMLInputElement) {
        if (Bowser.msie) {
          let textRange: TextRange = input.createTextRange();
          textRange.moveStart("character", input.value.length);
          textRange.collapse();
          textRange.select();
        }
        else {
          input.focus();
          let length: number = input.value.length;
          input.setSelectionRange(length, length);
        }
      };
    }

    if (
      typeof DwtInputField !== "undefined" && DwtInputField !== null &&
      (typeof DwtInputField.prototype.moveCursorToEnd === "undefined" || DwtInputField.prototype.moveCursorToEnd === null)
    ) {
      DwtInputField.prototype.moveCursorToEnd = function () {
        Dwt.moveCursorToEnd(this._inputField);
      };
    }
  }

}

type TextRange = {
  moveStart: (char: string, length: number) => void;
  collapse: () => void;
  select: () => void;
};

type ExtendedHTMLInputElement = HTMLInputElement & { createTextRange: () => TextRange; };
