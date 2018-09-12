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

import {applyMiddleware, createStore, Store} from "redux";

import {i18nReducer} from "../../i18n/i18nReducer";
import {Ii18n} from "../../i18n/Ii18n";
import {Ii18nStoreFactory} from "../../i18n/Ii18nStoreFactory";

import {ISetTranslationsAction} from "../ISetTranslationsAction";

export class I18nStoreFactory implements Ii18nStoreFactory {
  private mZimletStringMap: {[key: string]: string};
  private mLocale: string;

  constructor(zimletStringMap: {[key: string]: string}, locale: string) {
    this.mZimletStringMap = zimletStringMap;
    this.mLocale = locale;
  }

  public createStore(): Store<Ii18n> {
    const store = createStore(
      i18nReducer,
      {
        __locale: this.mLocale,
      },
      applyMiddleware(),
    );
    store.dispatch<ISetTranslationsAction>({
      translations: this.mZimletStringMap,
      type: "SET_TRANSLATION",
    });
    return store;
  }
}
