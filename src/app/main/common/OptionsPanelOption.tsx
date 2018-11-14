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

import {Component, ComponentChild, h} from "preact";

import "./OptionsPanelOption.scss";

import {IOpenChatSelectableItem} from "../../../redux/IOpenChatUIState";

export interface IOptionsPanelOption {
  icon?: string;
  label: string;
  onClick?: (selectedItem: IOpenChatSelectableItem) => void;
  panel?: typeof OptionsPanelOptionChildPanel;
  panelProps?: {};
  selectedItem: IOpenChatSelectableItem;
}

interface IOptionsPanelOptionState {
  expanded: boolean;
}

export class OptionsPanelOption extends Component<IOptionsPanelOption, IOptionsPanelOptionState> {

  constructor(props: IOptionsPanelOption) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  public render(props: IOptionsPanelOption, state: IOptionsPanelOptionState): ComponentChild {
    return (
      <div
        className={`OptionsPanelOption${state.expanded ? " OptionsPanelOption-selected" : ""}`}
      >
        <div
          className="OptionsPanelOption-label"
          onClick={this.expandCollapsePanel}
        >
          <i
            className={`fas fal fa-fw ${props.icon || ""}`}
          />
          {props.label}
        </div>
        {state.expanded && <div className="OptionsPanelOption-panel">
          {h(props.panel, {
            ...props.panelProps,
            closePanel: this.expandCollapsePanel,
            selectedItem: props.selectedItem,
          })}
        </div>}
      </div>
    );
  }

  private expandCollapsePanel = () => {
    if (typeof this.props.onClick !== "undefined" && this.props.onClick !== null) {
      this.props.onClick(this.props.selectedItem);
    } else {
      this.setState({
        expanded: !this.state.expanded,
      });
    }
  }

}

export interface IOptionsPanelOptionChildPanelProps {
  closePanel: () => void;
  selectedItem: IOpenChatSelectableItem;
}

export interface IOptionsPanelOptionChildPanelState {
}

// tslint:disable-next-line:max-classes-per-file
// tslint:disable-next-line:max-line-length
export class OptionsPanelOptionChildPanel<P extends IOptionsPanelOptionChildPanelProps, S extends IOptionsPanelOptionChildPanelState>
  extends Component<P, S> {
  public render(): ComponentChild {
    return <div/>;
  }
}
