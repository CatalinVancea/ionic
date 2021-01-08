import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { StudentProps } from './StudentProps';
import {createStudent, getStudents, newWebSocket, updateStudent, removeStudent, getStudentsPaging} from './StudentApi';
import { AuthContext } from '../auth';
import {useNetwork} from "./useNetwork";
import {Plugins} from "@capacitor/core";

const log = getLogger('StudentProvider');

type SaveStudentFn = (student: StudentProps) => Promise<any>;
type DeleteStudentFn = (student: StudentProps) => Promise<any>;
type FetchStudentPagingFn = (indexx: bigint) => Promise<any>;

type GetStudentDBFn = (studentId: string) => Promise<any>;
type SaveStudentDBFn = (student: StudentProps) => Promise<any>;
type DeleteStudentsDBFn = () => Promise<any>;
type DeleteStudentDBFn = (studentId: string) => Promise<any>;


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
const UPDATE_STUDENTS_LIST = 'UPDATE_STUDENTS_LIST';

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
                log(`/////////////////////////////////////////////////////ppppppppppppppppppppppppppppppppppppppppppppppppppppp`);
                //log(`pppppppp: `, payload.student);
                log(index);
                if (index === -1) {
                    students.splice(0, 0, student);
                } else {
                    log(`/////////////////////////////////////////////////////pppppppppppppppppppppppppppppppppppppppppppppppp`);
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
            case UPDATE_STUDENTS_LIST:
                console.log("1dispach update start")
                var studentsUpdate : StudentProps[];
                studentsUpdate = payload.studentss;

                const studentsUpdate2 = payload.studentss || []


                var students33 = [...(state.students || [])];
                console.log("2dispach update finish", students33)
                students33.concat(studentsUpdate)

                studentsUpdate.forEach((s)=>{
                    students33.push(s)
                    console.log("xdispach update finish", s)
                })

                students33 = [...students33, ...studentsUpdate]

                console.log("3dispach update finish", students33)
                console.log("4dispach update finish", studentsUpdate)
                console.log("5dispach update finish", studentsUpdate2)
                //return { ...state, students:studentsUpdate, saving: false, fetching: false };





                return { ...state, students:students33, saving: false, fetching: false };
            default:
                return state;
        }
    };

export const StudentContext = React.createContext<StudentsState>(initialState);

interface StudentProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
    const { networkStatus } = useNetwork();
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { students, fetching, fetchingError, saving, savingError } = state;
    useEffect(getStudentsEffect, [token]);
    useEffect(wsEffect, [token]);
    useEffect(resolveVersionConflict, [networkStatus.connected]);
    const saveStudent = useCallback<SaveStudentFn>(saveStudentCallback, [token]);
    const deleteStudent = useCallback<DeleteStudentFn>(deleteStudentCallback, [token]);
    const fetchStudentPaging = useCallback<FetchStudentPagingFn>(getStudentsEffectPaging, [token]);
    const value = { students, fetching, fetchingError, saving, savingError, saveStudent, deleteStudent, fetchStudentPaging};

    const saveStudentDB = useCallback<SaveStudentDBFn>(saveStudentDBCallback, []);
    const deleteStudentDB = useCallback<DeleteStudentDBFn>(deleteStudentDBCallback, []);
    const getStudentDB = useCallback<GetStudentDBFn>(getStudentDBCallback, []);
    const deleteStudentsDB = useCallback<DeleteStudentsDBFn>(deleteStudentsDBCallback, []);

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

                await deleteStudentsDBCallback()

                await students.forEach(async it=>{
                    await saveStudentDBCallback(it)
                })

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

    function resolveVersionConflict() {

        if (networkStatus.connected) {

        }else{

        }
    }

    async function saveStudentCallback(student: StudentProps) {

        if (networkStatus.connected) {
            try {
                log('saveStudent started');
                dispatch({ type: SAVE_STUDENT_STARTED });
                log(`saveStudent, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
                const savedStudent = await (student.id ? updateStudent(token, student) : createStudent(token, student));
                log('saveStudent succeeded');
                await saveStudentDBCallback(student)
                //dispatch({ type: SAVE_STUDENT_SUCCEEDED, payload: { student: savedStudent } });
            } catch (error) {
                log('saveStudent failed');
                dispatch({ type: SAVE_STUDENT_FAILED, payload: { error } });
            }
        }else {
            // await saveStudentDBCallback(student)
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
            if(networkStatus.connected == true) {
                log(networkStatus.connected)
                if (canceled) {
                    return;
                }
                const {event, payload: student} = message;
                if (event === 'created' || event === 'updated') {
                    log("------------------------------------------------------")
                    log(`wsEffect created/updated, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
                    dispatch({type: SAVE_STUDENT_SUCCEEDED, payload: {student}});
                    saveStudentDBCallback(student)
                }
                if (event === 'deleted') {
                    log("------------------------------------------------------")
                    log(`wsEffect deleted, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
                    dispatch({type: DELETE_STUDENT_SUCCEEDED, payload: {student}});
                    deleteStudentDBCallback(student.id || "")
                }
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }

    async function saveStudentDBCallback(student: StudentProps) {
        log('saveStudentDBCallback');
        await (async () => {
            const { Storage } = Plugins;

            console.log('Keys found before set', await Storage.keys());

            // Saving ({ key: string, value: string }) => Promise<void>
            await Storage.set({
                key: student.id || "",
                value: JSON.stringify({
                    student: student
                })
            });
            console.log('Keys found after set', await Storage.keys());
            console.log('student is setted in local storage');
            await updateStudentsListCallback()
        })();
    }
    async function getStudentDBCallback(studentId: string) {
        log('getStudentDBCallback');
        var student:StudentProps
        student = await (async (studentId) => {
            const { Storage } = Plugins;

            // Loading value by key ({ key: string }) => Promise<{ value: string | null }>
            const res = await Storage.get({ key: studentId});
            if (res.value) {
                console.log('Student found', JSON.parse(res.value));

                let {student: student2} = JSON.parse(res.value)
                return student2

            } else {
                console.log('Student not found');
            }

            console.log('student is deleted from local storage');
        })(studentId);
        return student
    }
    async function deleteStudentDBCallback(studentId: string) {
        log('deleteStudentDBCallback');
        await (async (studentId) => {
            const {Storage} = Plugins;

            console.log('Keys found before remove', await Storage.keys());
            // Removing value by key, ({ key: string }) => Promise<void>
            await Storage.remove({key: studentId});
            console.log('Keys found after remove', await Storage.keys());

            console.log('student is deleted from local storage');
        })(studentId);
    }
    async function deleteStudentsDBCallback() {
        log('deleteStudentsDBCallback');
        await (async () => {
            const {Storage} = Plugins;

            console.log('Keys found before delete', await Storage.keys());
            const {keys} = await Storage.keys();
            keys.forEach(async (key) => {
                if (key != "token") {
                    await deleteStudentDBCallback(key)
                }
            })
            console.log('Keys found after delete', await Storage.keys());

            console.log('students are deleted from local storage');
        })();
    }
    async function updateStudentsListCallback() {

        log('deleteStudentsDBCallback');
        await (async () => {
            const {Storage} = Plugins;

            var studentss: StudentProps[];
            studentss = []

            // Loading keys () => Promise<{ keys: string[] }>
            const {keys} = await Storage.keys();
            console.log('Keys found', keys);

            await keys.forEach(async key=>{

                if(key != "token"){
                let student = await getStudentDBCallback(key)
                console.log("I found this student:", student)
                console.log("I found this studentss:", studentss)

                    //studentss = studentss.splice(0,0, student);
                    studentss.push(student);
                    //studentss.splice(0,0,student);
                }
            })

            console.log("-----------------------------------cacacacacaacaac")
            console.log("I send this studentss:", studentss)
            dispatch({type: UPDATE_STUDENTS_LIST, payload: {studentss}});

            console.log('students are deleted from local storage');
        })();
    }
};
