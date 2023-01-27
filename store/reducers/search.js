import * as actionTypes from '../actions/actionTypes';

const initialState = {
    searchValue: '',
    searchChanged:false,
    searchClicked:false,
    languageChanged:false,
    themeType:null,
    menuOpen:true
};


let reducer = function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.SEARCH_VALUE:
        return {
          ...state,
          searchValue:action.value
        }
        case actionTypes.LANGUAGE_CHANGED:
        return {
          ...state,
          languageChanged:action.status
        }
        case actionTypes.THEME_CHANGED:
        return {
          ...state,
          themeType:action.status
        }
        case actionTypes.SEARCH_CHANGED:
        return {
          ...state,
          searchChanged:action.status
        }
        case actionTypes.SEARCHCLICKED:
        return {
          ...state,
          searchClicked:action.status
        }
        case actionTypes.MENUOPENED:
        return {
          ...state,
          menuOpen:action.status
        }
        case actionTypes.UPDATEPAGEINFODATA:
          if(typeof action.menuOpen != "undefined"){
            return {
              ...state,
              menuOpen:action.menuOpen
            }
          }
        default:
          return state;
    }
}

export default reducer;