import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { StudentProps } from './StudentProps';
import {createParticipation, getExams, getParticipations, newWebSocket, updateParticipation} from "./ItemsApi";
import {ExamProps} from "./ExamProps";
import {ParticipationProps} from "./ParticipationProps";

const log = getLogger('ItemmmmProvider');

type SaveParticipationFn = (participation: ParticipationProps) => Promise<any>;

export interface ItemsState {
    
    exams?: ExamProps[],
    participations?: ParticipationProps[],

    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveParticipation?: SaveParticipationFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';

const SAVE_PARTICIPATION_STARTED = 'SAVE_PARTICIPATION_STARTED';
const SAVE_PARTICIPATION_SUCCEEDED = 'SAVE_PARTICIPATION_SUCCEEDED';
const SAVE_PARTICIPATION_FAILED = 'SAVE_PARTICIPATION_FAILED';


const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, exams: payload.exams, participations: payload.participations, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_PARTICIPATION_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_PARTICIPATION_SUCCEEDED:


                const participations = [...(state.participations || [])];
                const participation = payload.participation;
                const index = participations.findIndex(it => it.id === participation.id);
                if (index === -1) {
                    participations.splice(0, 0, participation);
                } else {
                    log(`reducer, participation: ${participation.id}  ${participation.examId}  ${participation.student}  ${participation.status}`);
                    participations[index] = participation;
                }
                return { ...state, participations, saving: false };
            case SAVE_PARTICIPATION_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ParticipationProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ParticipationProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { exams, participations, fetching, fetchingError, saving, savingError } = state;
    useEffect(getItemsEffect, []);
    useEffect(wsEffect, []);
    const saveParticipation = useCallback<SaveParticipationFn>(saveParticipationCallback, []);
    const value = { exams, participations, fetching, fetchingError, saving, savingError, saveParticipation};
    log('returns');

    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            try {
                log('fetchItems started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                const exams = await getExams();
                const participations = await getParticipations();
                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { exams, participations } });
                }
            } catch (error) {
                log('fetchItems failed');
                dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
            }
        }
    }

    async function saveParticipationCallback(participation: ParticipationProps) {
        try {
            log('saveParticipation started');
            dispatch({ type: SAVE_PARTICIPATION_STARTED });
            const savedParticipation = await (participation.id ? updateParticipation(participation) : createParticipation(participation));
            log('saveParticipation succeeded');
            dispatch({ type: SAVE_PARTICIPATION_SUCCEEDED, payload: { participation: savedParticipation } });
        } catch (error) {
            log('saveParticipation failed');
            dispatch({ type: SAVE_PARTICIPATION_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const {payload: { participation }} = message;

            log(`ws message, participation id ${participation.id}`);

            dispatch({ type: SAVE_PARTICIPATION_SUCCEEDED, payload: { participation } });
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
