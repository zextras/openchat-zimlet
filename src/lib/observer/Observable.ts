/*
 * **** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2018 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * **** END LICENSE BLOCK *****
 */

import {IObservable, IObserver, IUnsubscribe} from "./IObservable";

export class Observable implements IObservable {

  private mSubscriptions: {[action: string]: Array<IObserver<any>>} = {};

  public emit<T>(action: string, data?: T): void {
    if (this.mSubscriptions.hasOwnProperty(action)) {
      for (const observer of this.mSubscriptions[action]) {
        try {
          observer(action, data);
        } catch (err) {}
      }
    }
  }

  public subscribe<T>(action: string, observer: IObserver<T>): IUnsubscribe {
    if (!this.mSubscriptions.hasOwnProperty(action)) {
      this.mSubscriptions[action] = [];
    }
    this.mSubscriptions[action].push(observer);
    return () => this.unsubscribe(action, observer);
  }

  public unsubscribe(action: string, observer: IObserver<any>): void {
    if (this.mSubscriptions.hasOwnProperty(action)) {
      for (let i: number = 0; i < this.mSubscriptions[action].length; i++) {
        if (this.mSubscriptions[action][i] === observer) {
          this.mSubscriptions[action].splice(i, 1);
          i--;
        }
      }
    }
  }

}
