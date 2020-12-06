import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { StudentProps } from './StudentProps';
import {createStudent, getStudents, newWebSocket, updateStudent, removeStudent, getStudentsPaging} from './StudentApi';
import { AuthContext } from '../auth';

const log = getLogger('StudentProvider');

type SaveStudentFn = (student: StudentProps) => Promise<any>;
type DeleteStudentFn = (student: StudentProps) => Promise<any>;
type FetchStudentPagingFn = (indexx: bigint) => Promise<any>;

export interface StudentsState {
    students?: StudentProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveStudent?: SaveStudentFn,
    deleteStudent?: DeleteStudentFn,
    fetchStudentPaging?: FetchStudentPagingFn,
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
const DELETE_STUDENT_STARTED = 'DELETE_STUDENT_STARTED';
const DELETE_STUDENT_SUCCEEDED = 'DELETE_STUDENT_SUCCEEDED';
const DELETE_STUDENT_FAILED = 'DELETE_STUDENT_FAILED';
const FETCH_STUDENTS_PAGING = 'FETCH_STUDENTS_PAGING';

const reducer: (state: StudentsState, action: ActionProps) => StudentsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_STUDENTS_STARTED:
                log('FETCH_STUDENTS_STARTED');
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_STUDENTS_SUCCEEDED:
                log('FETCH_STUDENTS_SUCCEEDED');
                return { ...state, students: payload.students, fetching: false };
            case FETCH_STUDENTS_FAILED:
                log('FETCH_STUDENTS_FAILED');
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_STUDENT_STARTED:
                log('SAVE_STUDENT_STARTED');
                return { ...state, savingError: null, saving: true };
            case SAVE_STUDENT_SUCCEEDED:
                log('SAVE_STUDENT_SUCCEEDED');
                const students = [...(state.students || [])];
                const student = payload.student;
                const index = students.findIndex(it => it.id === student.id);
                log(`/////////////////////////////////////////////////////`);
                log(index);
                if (index === -1) {
                    students.splice(0, 0, student);
                } else {
                    log(`/////////////////////////////////////////////////////`);
                    log(`reducer, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}   ${student.version}`);
                    students[index] = student;
                }
                return { ...state, students:students, saving: false };
            case SAVE_STUDENT_FAILED:
                log('SAVE_STUDENT_FAILED');
                return { ...state, savingError: payload.error, saving: false };
            case DELETE_STUDENT_STARTED:
                log('DELETE_STUDENT_STARTED');
                return { ...state, savingError: null, saving: true };
            case DELETE_STUDENT_SUCCEEDED:
                log('DELETE_STUDENT_SUCCEEDED');
                const students2 = [...(state.students || [])];
                const student2 = payload.student;
                const index2 = students2.findIndex(it => it.id === student2.id);
                log(`reducer-delete1, index2: ${index2}`);
                if (index2 === -1) {
                    log(`reducer-delete2, index2: ${index2}`);
                    // students2.splice(0, 0, student2);
                } else {
                    log(`reducer-delete3, student: ${student2.name}  ${student2.graduated}  ${student2.grade}  ${student2.enrollment}`);
                    log(`reducer-delete4, student: ${students2.length}`);
                    //students2[index2] = students2[index2+1];
                    students2.splice(index2, 1);
                    log(`reducer-delete5, student: ${students2.length}`);
                }
                return { ...state, students:students2, saving: false };
            case DELETE_STUDENT_FAILED:
                log('DELETE_STUDENT_FAILED');
                return { ...state, savingError: payload.error, saving: false };
            case FETCH_STUDENTS_PAGING:
                //log('FETCH_STUDENTS_PAGING1');
                let studentsAll = [...(state.students || [])];
                const studentsPaging = payload.student;
                //log('FETCH_STUDENTS_PAGING2'+studentsAll.length)
                //studentsAll.concat(studentsPaging);

                studentsAll = [...studentsAll, ...studentsAll];

                //studentsAll.splice(0, 0, studentsPaging);
                //log('FETCH_STUDENTS_PAGING3'+studentsAll.length)
                //log('FETCH_STUDENTS_PAGING4'+studentsPaging.length)
                //log('FETCH_STUDENTS_PAGING5'+studentsPaging)
                //log('FETCH_STUDENTS_PAGING6'+studentsAll)


                //log('FETCH_STUDENTS_PAGING7');
                return { ...state, students:studentsAll, saving: false, fetching: true };
            default:
                return state;
        }
    };

export const StudentContext = React.createContext<StudentsState>(initialState);

interface StudentProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { students, fetching, fetchingError, saving, savingError } = state;
    useEffect(getStudentsEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveStudent = useCallback<SaveStudentFn>(saveStudentCallback, [token]);
    const deleteStudent = useCallback<DeleteStudentFn>(deleteStudentCallback, [token]);
    const fetchStudentPaging = useCallback<FetchStudentPagingFn>(getStudentsEffectPaging, [token]);
    const value = { students, fetching, fetchingError, saving, savingError, saveStudent, deleteStudent, fetchStudentPaging};
    log('returns')

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );

    async function getStudentsEffectPaging() {
        let canceled = false;
        await fetchStudentsPaging();
        return () => {
            canceled = true;
        }

        async function fetchStudentsPaging() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchStudentsPaging started');
                dispatch({ type: FETCH_STUDENTS_STARTED });
                const students = await getStudentsPaging(token);
                log("fetchStudentsPaging2")
                log('fetchStudentsPaging succeeded');
                dispatch({ type: FETCH_STUDENTS_PAGING, payload: { students } });




                log("fetchStudentsPaging3")
                log("fetchStudentsPaging4"+fetching)

                if (students && students.length > 0) {
                    if(students.length<3)
                        return true;
                    else
                        return false;
                    //setDisableInfiniteScroll(students.length < 3);
                } else {
                    //setDisableInfiniteScroll(true);
                    return true;
                }

            } catch (error) {
                log('fetchStudentsPaging failed');
                dispatch({ type: FETCH_STUDENTS_FAILED, payload: { error } });
            }
        }
    }

    function getStudentsEffect() {
        log('getStudentsEffect');
        let canceled = false;
        fetchStudents();
        return () => {
            canceled = true;
        }

        async function fetchStudents() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchStudents started');
                dispatch({ type: FETCH_STUDENTS_STARTED });
                const students = await getStudents(token);
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
            log(`saveStudent, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
            const savedStudent = await (student.id ? updateStudent(token, student) : createStudent(token, student));
            log('saveStudent succeeded');
            //dispatch({ type: SAVE_STUDENT_SUCCEEDED, payload: { student: savedStudent } });
        } catch (error) {
            log('saveStudent failed');
            dispatch({ type: SAVE_STUDENT_FAILED, payload: { error } });
        }
    }

    async function deleteStudentCallback(student: StudentProps) {
        try {
            log('deleteStudent started');
            dispatch({ type: DELETE_STUDENT_STARTED });
            const deletedStudent = await (removeStudent(token, student));
            log('deleteStudent succeeded');
            dispatch({ type: DELETE_STUDENT_SUCCEEDED, payload: { student: deletedStudent } });
        } catch (error) {
            log('deleteStudent failed');
            dispatch({ type: DELETE_STUDENT_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(token, message => {
            if (canceled) {
                return;
            }
            const { event, payload:  student } = message;
            if (event === 'created' || event === 'updated') {
                log("------------------------------------------------------")
                log(`wsEffect created/updated, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
                dispatch({ type: SAVE_STUDENT_SUCCEEDED, payload: { student } });
            }
            if (event === 'deleted') {
                log("------------------------------------------------------")
                log(`wsEffect deleted, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
                dispatch({ type: DELETE_STUDENT_SUCCEEDED, payload: { student } });
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
