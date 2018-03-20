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

import * as React from "react";
import * as ReactDOM from "react-dom";

import "./ReactDwtComposite.scss";

import {DwtComposite, DwtCompositeParams} from "../../zimbra/ajax/dwt/widgets/DwtComposite";

export abstract class ReactDwtComposite<P, S extends React.ComponentState> extends DwtComposite {
  protected props: P;
  protected mComponent: React.Component<P>;

  constructor(
    params: DwtCompositeParams & { props?: P },
  ) {
    super({
      ...params,
      className: `ReactDwtComposite ${typeof params.className !== "undefined" ? params.className : ""}`,
    } as DwtCompositeParams & { props?: P });
    this.props = params.props;
    this._setAllowSelection();

    this.overrideDwtKeyMapMgr_isInputElement();
    // // Render the App Main View
    // this.mountComponent();
    // const component = ReactDOM.render(
    //   this.render() as JSX.Element,
    //   this.getHtmlElement(),
    //   this.onElementRendered,
    // ) as React.Component<P>;
    // if (typeof this.mComponent === "undefined" || this.mComponent === null) {
    //   this.mComponent = component;
    // }
  }

  public abstract render(): JSX.Element | false | null;

  public mountComponent(): void {
    const component = ReactDOM.render(
      this.render() as JSX.Element,
      this.getHtmlElement(),
      this.onElementRendered,
    ) as React.Component<P>;
    if (typeof this.mComponent === "undefined" || this.mComponent === null) {
      this.mComponent = component;
    }
  }

  public unmountComponent(): void {
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this.mComponent));
  }

  protected setState<K extends keyof S>(state: Pick<S, K>): void {
    if (typeof this.mComponent !== "undefined" && this.mComponent !== null) {
      (this.mComponent as React.Component).setState((prevState) => {
        return {
          ...prevState,
          ...state as {},
        };
      });
    }
  }

  protected getState(): S {
    if (typeof this.mComponent !== "undefined" && this.mComponent !== null) {
      return (this.mComponent as React.Component).state as S;
    }
  }

  private onElementRendered = (component: React.Component<any, React.ComponentState> | Element | void) => {
    if (typeof this.mComponent === "undefined" || this.mComponent === null) {
      this.mComponent = component as React.Component<P>;
    }
  }

  private overrideDwtKeyMapMgr_isInputElement(): void {
    if (typeof window !== "undefined" && typeof (window as IWindowWithDwtKeyMapMgr).DwtKeyMapMgr !== "undefined") {
      (window as IWindowWithDwtKeyMapMgr).DwtKeyMapMgr.isInputElement = (element: HTMLElement) => {
        if (!element) { return false; }
        // Check designMode in case we're in an HTML editor iframe
        const dm = element.ownerDocument ? element.ownerDocument.designMode : null;
        if (dm && (dm.toLowerCase() === "on")) { return true; }

        const tag = element.tagName.toUpperCase();
        return (
          tag === "INPUT"
          || tag === "TEXTAREA"
          || (element.contentEditable && (element.contentEditable.toUpperCase() === "TRUE"))
        );
      };
    }
  }

}

interface IWindowWithDwtKeyMapMgr extends Window {
  DwtKeyMapMgr: {
    isInputElement: (element: HTMLElement) => boolean,
  };
}
