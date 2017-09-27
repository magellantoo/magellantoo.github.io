// Dependencies
import { combineReducers } from 'redux';

// Components
import { MENU_ITEM_ID } from '../containers/menuItems';

export interface IState {
    title: string;
    leftItems: number[];
}

export const reducer = combineReducers<IState>({
    title: (state = 'Bgg Api Viewer', action) => {
        const {
            type,
        } = action;

        switch (type) {
            default: return state;
        }
    },
    leftItems: (
        state = [
            MENU_ITEM_ID.togglePullout,
        ],
        action) => {
        return state;
    },
});