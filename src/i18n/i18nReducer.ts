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

import {Reducer} from "redux";

import {Ii18n} from "./Ii18n";

import {ISetLocaleAction} from "./ISetLocaleAction";
import {ISetTranslationsAction} from "./ISetTranslationsAction";

export const i18nReducer: Reducer<Ii18n, ISetTranslationsAction|ISetLocaleAction> = (
  state: Ii18n | undefined = {
    __locale: "",
  },
  action: ISetTranslationsAction|ISetLocaleAction,
): Ii18n => {

  switch (action.type) {
    case "SET_LOCALE": {
      return {
        ...state,
        __locale: action.locale,
      };
    }
    case "SET_TRANSLATION": {
      return {
        __locale: state.__locale,
        ...action.translations,
      };
    }
    default: {
      return state;
    }
  }

};
