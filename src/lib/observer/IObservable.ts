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

export interface IObservable {

  subscribe<T>(action: string, observer: IObserver<T>): IUnsubscribe;
  unsubscribe(action: string, observer: IObserver<any>): void;
  emit<T>(action: string, data?: T): void;

}

export type IObserver<T> = (action: string, data: T) => void;
export type IUnsubscribe = () => void;
