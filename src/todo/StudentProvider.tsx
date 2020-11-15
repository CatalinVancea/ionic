import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { StudentProps } from './StudentProps';
import { createStudent, getStudents, newWebSocket, updateStudent } from './StudentApi';

const log = getLogger('StudentProvider');

type SaveStudentFn = (student: StudentProps) => Promise<any>;

export interface StudentsState {
    students?: StudentProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveStudent?: SaveStudentFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: StudentsState = {
    fetching: false,
    saving: false,
};

const FETCH_STUDENTS_STARTED = 'FETCH_STUDENTS_STARTED';
const FETCH_STUDENTS_SUCCEEDED = 'FETCH_STUDENTS_SUCCEEDED';
const FETCH_STUDENTS_FAILED = 'FETCH_STUDENTS_FAILED';
const SAVE_STUDENT_STARTED = 'SAVE_STUDENT_STARTED';
const SAVE_STUDENT_SUCCEEDED = 'SAVE_STUDENT_SUCCEEDED';
const SAVE_STUDENT_FAILED = 'SAVE_STUDENT_FAILED';

const reducer: (state: StudentsState, action: ActionProps) => StudentsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_STUDENTS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_STUDENTS_SUCCEEDED:
                return { ...state, students: payload.students, fetching: false };
            case FETCH_STUDENTS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_STUDENT_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_STUDENT_SUCCEEDED:
                const students = [...(state.students || [])];
                const student = payload.student;
                const index = students.findIndex(it => it.id === student.id);
                if (index === -1) {
                    students.splice(0, 0, student);
                } else {
                    students[index] = student;
                }
                return { ...state, students, saving: false };
            case SAVE_STUDENT_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const StudentContext = React.createContext<StudentsState>(initialState);

interface StudentProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { students, fetching, fetchingError, saving, savingError } = state;
    useEffect(getStudentsEffect, []);
    useEffect(wsEffect, []);
    const saveStudent = useCallback<SaveStudentFn>(saveStudentCallback, []);
    const value = { students, fetching, fetchingError, saving, savingError, saveStudent };
    log('returns');

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );

    function getStudentsEffect() {
        let canceled = false;
        fetchStudents();
        return () => {
            canceled = true;
        }

        async function fetchStudents() {
            try {
                log('fetchStudents started');
                dispatch({ type: FETCH_STUDENTS_STARTED });
                const students = await getStudents();
                log('fetchStudents succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_STUDENTS_SUCCEEDED, payload: { students } });
                }
            } catch (error) {
                log('fetchStudents failed');
                dispatch({ type: FETCH_STUDENTS_FAILED, payload: { error } });
            }
        }
    }

    async function saveStudentCallback(student: StudentProps) {
        try {
            log('saveStudent started');
            dispatch({ type: SAVE_STUDENT_STARTED });
            const savedStudent = await (student.id ? updateStudent(student) : createStudent(student));
            log('saveStudent succeeded');
            dispatch({ type: SAVE_STUDENT_SUCCEEDED, payload: { student: savedStudent } });
        } catch (error) {
            log('saveStudent failed');
            dispatch({ type: SAVE_STUDENT_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { student }} = message;
            log(`ws message, student ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({ type: SAVE_STUDENT_SUCCEEDED, payload: { student } });
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
