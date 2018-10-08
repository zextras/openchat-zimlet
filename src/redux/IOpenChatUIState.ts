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

import {OptionsPanelOptionChildPanel} from "../app/main/common/OptionsPanelOption";

export interface IInputToolbarButtons {
  left: JSX.Element[];
  right: JSX.Element[];
}

export interface IOpenChatSelectableItem {
  hasFocus: boolean;
  id: string;
  type: IOpenChatSelectableItemType;
}

export type IOpenChatSelectableItemType =  "buddy" | string;

export interface ISelectorOption {
  icon: string;
  onClick?: (selectedItem: IOpenChatSelectableItem) => void;
  label: string;
  panel?: typeof OptionsPanelOptionChildPanel;
  panelProps?: {};
}

export interface IToolbarButtonDescription extends ISelectorOption {
  onClick: (selectedItem: IOpenChatSelectableItem) => void;
}

export interface IOpenChatUIState {
  itemSelected: IOpenChatSelectableItem;
  inputToolbarButtons: IInputToolbarButtons;
  optionPanelHidden: boolean;
}
