import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { StudentProps } from './StudentProps';
import {
    createStudent,
    getStudents,
    newWebSocket,
    updateStudent,
    removeStudent,
    getStudentsPaging,
    getStudent,
    forceUpdateStudentApi
} from './StudentApi';
import { AuthContext } from '../auth';
import {useNetwork} from "./useNetwork";
import {Plugins} from "@capacitor/core";

const log = getLogger('StudentProvider');

type SaveStudentFn = (student: StudentProps) => Promise<any>;
type ForceUpdateStudentFn = (student: StudentProps) => Promise<any>;
type DeleteStudentFn = (student: StudentProps) => Promise<any>;
type FetchStudentPagingFn = (indexx: bigint) => Promise<any>;

type GetStudentDBFn = (studentId: string) => Promise<StudentProps>;
type SaveStudentDBFn = (student: StudentProps) => Promise<any>;
type DeleteStudentsDBFn = () => Promise<any>;
type SyncFunctionFn = () => void;
type DeleteStudentDBFn = (studentId: string) => Promise<any>;


export interface StudentsState {
    students?: StudentProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveStudent?: SaveStudentFn,
    syncFunction?: SyncFunctionFn,
    deleteStudent?: DeleteStudentFn,
    fetchStudentPaging?: FetchStudentPagingFn,
    lostConnection?: boolean,
    forceUpdateStudent?: ForceUpdateStudentFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: StudentsState = {
    fetching: false,
    saving: false,
    lostConnection: false
};

const FETCH_STUDENTS_STARTED = 'FETCH_STUDENTS_STARTED';
const FETCH_STUDENTS_SUCCEEDED = 'FETCH_STUDENTS_SUCCEEDED';
const FETCH_STUDENTS_FAILED = 'FETCH_STUDENTS_FAILED';

const SAVE_STUDENT_STARTED = 'SAVE_STUDENT_STARTED';
const SAVE_STUDENT_CALLBACK_STARTED = 'SAVE_STUDENT_CALLBACK_STARTED';
const SAVE_STUDENT_SUCCEEDED = 'SAVE_STUDENT_SUCCEEDED';
const SAVE_STUDENT_CALLBACK_SUCCEEDED = 'SAVE_STUDENT_CALLBACK_SUCCEEDED';
const SAVE_STUDENT_WS_SUCCEEDED = 'SAVE_STUDENT_WS_SUCCEEDED';
const SAVE_STUDENT_FAILED = 'SAVE_STUDENT_FAILED';
const SAVE_STUDENT_CALLBACK_FAILED = 'SAVE_STUDENT_CALLBACK_FAILED';
const SAVE_STUDENT_CALLBACK_NETWORK_FAILED = 'SAVE_STUDENT_CALLBACK_NETWORK_FAILED';
const SAVE_STUDENT_CALLBACK_CONFLICT_FAILED = 'SAVE_STUDENT_CALLBACK_CONFLICT_FAILED';


const DELETE_STUDENT_STARTED = 'DELETE_STUDENT_STARTED';
const DELETE_STUDENT_SUCCEEDED = 'DELETE_STUDENT_SUCCEEDED';
const DELETE_STUDENT_WS_SUCCEEDED = 'DELETE_STUDENT_WS_SUCCEEDED';
const DELETE_STUDENT_FAILED = 'DELETE_STUDENT_FAILED';

const FETCH_STUDENTS_PAGING = 'FETCH_STUDENTS_PAGING';

const UPDATE_STUDENTS_LIST = 'UPDATE_STUDENTS_LIST';

const reducer: (state: StudentsState, action: ActionProps) => StudentsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_STUDENTS_STARTED:
                log("reducer: FETCH_STUDENTS_STARTED")
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_STUDENTS_SUCCEEDED:
                log("reducer: FETCH_STUDENTS_SUCCEEDED")
                return { ...state, students: payload.students, fetching: false };
            case FETCH_STUDENTS_FAILED:
                log("reducer: FETCH_STUDENTS_FAILED")
                return { ...state, fetchingError: payload.error, fetching: false };

            case SAVE_STUDENT_STARTED:
                log("reducer: SAVE_STUDENT_STARTED")
                return { ...state, savingError: null, saving: true };
            case SAVE_STUDENT_CALLBACK_STARTED:
                log("reducer: SAVE_STUDENT_CALLBACK_STARTED")
                return { ...state, savingError: null, saving: true };
            case SAVE_STUDENT_SUCCEEDED:
                log("reducer: SAVE_STUDENT_SUCCEEDED")
                const students = [...(state.students || [])];
                const student = payload.student;
                const index = students.findIndex(it => it.id === student.id);
                log(index);
                if (index === -1) {
                    students.splice(0, 0, student);
                } else {
                    //log(`reducer, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}   ${student.version}`);
                    students[index] = student;
                }

                //log("reducer: SAVE_STUDENT_SUCCEEDED", state.students)
                //log("reducer: SAVE_STUDENT_SUCCEEDED", students)
                return { ...state, students:students, saving: false };
            case SAVE_STUDENT_CALLBACK_SUCCEEDED:
                log("reducer: SAVE_STUDENT_CALLBACK_SUCCEEDED")
                return { ...state, saving: false, lostConnection: false};
            case SAVE_STUDENT_WS_SUCCEEDED:
                log("reducer: SAVE_STUDENT_WS_SUCCEEDED")
                return { ...state, saving: false, lostConnection: false};
            case SAVE_STUDENT_FAILED:
                log("reducer: SAVE_STUDENT_FAILED")
                return { ...state, savingError: payload.error, saving: false };
            case SAVE_STUDENT_CALLBACK_FAILED:
                log("reducer: SAVE_STUDENT_CALLBACK_FAILED")
                return { ...state, savingError: payload.error, saving: false };
            case SAVE_STUDENT_CALLBACK_CONFLICT_FAILED:
                log("reducer: SAVE_STUDENT_CALLBACK_CONFLICT_FAILED")
                return { ...state, savingError: payload.error, saving: false };
            case SAVE_STUDENT_CALLBACK_NETWORK_FAILED:
                log("reducer: SAVE_STUDENT_CALLBACK_NETWORK_FAILED")
                return { ...state, savingError: payload.error, saving: false, lostConnection: true };
            case DELETE_STUDENT_STARTED:
                log("reducer: DELETE_STUDENT_STARTED")
                return { ...state, savingError: null, saving: true };
            case DELETE_STUDENT_SUCCEEDED:
                log("reducer: DELETE_STUDENT_SUCCEEDED")
                const students2 = [...(state.students || [])];
                const student2 = payload.student;
                const index2 = students2.findIndex(it => it.id === student2.id);
                //log(`reducer-delete1, index2: ${index2}`);
                if (index2 === -1) {
                    //log(`reducer-delete2, index2: ${index2}`);
                    // students2.splice(0, 0, student2);
                } else {
                    //log(`reducer-delete3, student: ${student2.name}  ${student2.graduated}  ${student2.grade}  ${student2.enrollment}`);
                    //log(`reducer-delete4, student: ${students2.length}`);
                    //students2[index2] = students2[index2+1];
                    students2.splice(index2, 1);
                    //log(`reducer-delete5, student: ${students2.length}`);
                }
                return { ...state, students:students2, saving: false };
            case DELETE_STUDENT_WS_SUCCEEDED:
                log("reducer: DELETE_STUDENT_WS_SUCCEEDED")
                return { ...state, saving: false };
            case DELETE_STUDENT_FAILED:
                log("reducer: DELETE_STUDENT_FAILED")
                return { ...state, savingError: payload.error, saving: false };

            case FETCH_STUDENTS_PAGING:
                log("reducer: FETCH_STUDENTS_PAGING")
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
                log("reducer: UPDATE_STUDENTS_LIST")
                var studentsUpdate : StudentProps[];
                studentsUpdate = payload.studentss;

                const students4 = [...(state.students || [])];
                //log("reducer: UPDATE_STUDENTS_LIST", studentsUpdate)
                //log("reducer: UPDATE_STUDENTS_LIST", state.students)
                //log("reducer: UPDATE_STUDENTS_LIST", students4)
                return { ...state, students:studentsUpdate, saving: false, fetching: false };
                //return { ...state, saving: false, fetching: false };
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
    const [ state, dispatch ] = useReducer(reducer, initialState);
    const { students, fetching, fetchingError, saving, savingError, lostConnection } = state;

    useEffect(getStudentsEffect, [token, state.lostConnection]);
    useEffect(wsEffect, [token, state.lostConnection]);
    useEffect(resolveVersionConflict, [networkStatus.connected]);

    const saveStudent = useCallback<SaveStudentFn>(saveStudentCallback, [token]);
    const deleteStudent = useCallback<DeleteStudentFn>(deleteStudentCallback, [token]);
    const fetchStudentPaging = useCallback<FetchStudentPagingFn>(getStudentsEffectPaging, [token]);

    const syncFunction = useCallback<SyncFunctionFn>(syncFunctionCallback, [token]);
    const forceUpdateStudent = useCallback<ForceUpdateStudentFn>(forceUpdateStudentCallback, [token]);

    //const saveStudentDB = useCallback<SaveStudentDBFn>(saveStudentDBCallback, []);
    //const deleteStudentDB = useCallback<DeleteStudentDBFn>(deleteStudentDBCallback, []);
    //const getStudentDB = useCallback<GetStudentDBFn>(getStudentDBCallback, []);
    //const deleteStudentsDB = useCallback<DeleteStudentsDBFn>(deleteStudentsDBCallback, []);

    const value = { students, fetching, fetchingError, saving, savingError, saveStudent, deleteStudent, fetchStudentPaging, syncFunction, forceUpdateStudent, lostConnection};

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

    async function syncFunctionCallback() {
        log("syncFunctionCallback")
        log("syncFunctionCallback: ",networkStatus.connected)
        log("syncFunctionCallback: ",state.lostConnection)

        if (networkStatus.connected != true || state.lostConnection != false) {
            await (async () => {
                const {Storage} = Plugins;

                // Loading keys () => Promise<{ keys: string[] }>
                const {keys} = await Storage.keys();
                log('Keys found', keys);

                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i]
                    if (key != "token") {
                        let student1: StudentProps = await getStudentDBCallback(key)

                        log("student.id: ")
                        log("student.id: ", student1)
                        log("student.id: ", student1.id)
                        log("student.id: ", student1.id==undefined)
                        log("student.id: ", student1.id==null)

                        if(student1.id == undefined || student1.id == null){
                            createStudent(token, student1)
                            continue;
                        }

                        let student2: StudentProps = await getStudent(token, student1)
                        log("mmmmmmmmmmmmmmmmmmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
                        log(student1.version)
                        log(student1.sync)
                        log(student2.version)
                        log(student2.sync)

                        if (student1.version == student2.version && student1.sync == false) {
                            log("beeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
                            try {
                                await (student1.id ? updateStudent(token, student1) : createStudent(token, student1));
                            } catch (error) {

                            }
                        }
                        if (student1.version != student2.version) {
                            //todo
                            try {
                                //await (student1.id ? updateStudent(token, student1) : createStudent(token, student1));
                            } catch (error) {

                            }
                        }
                    }
                }

                state.lostConnection = false;
            })();
        }
        getStudentsEffect()
    }

    function getStudentsEffect(){
        log("getStudentsEffect")
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
                    it.sync = true
                    await saveStudentDBCallback(it)
                })

                log('fetchStudents succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_STUDENTS_SUCCEEDED, payload: { students } });
                }
            } catch (error) {
                log('fetchStudents failed');
                updateStudentsListCallback()
                state.lostConnection = true
                log('fetchStudents failed', state.lostConnection);
                dispatch({ type: FETCH_STUDENTS_FAILED, payload: { error } });
            }
        }
    }

    function resolveVersionConflict() {

        if (networkStatus.connected) {

        }else{

        }
    }

    async function forceUpdateStudentCallback(student: StudentProps) {

        //throw new Error("Am here");

        if (networkStatus.connected) {
            try {
                log('saveStudent started');
                dispatch({ type: SAVE_STUDENT_STARTED });
                log(`saveStudent, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
                const savedStudent = await forceUpdateStudentApi(token, student);
                log('saveStudent succeeded');
                await saveStudentDBCallback(student)
                //dispatch({ type: SAVE_STUDENT_SUCCEEDED, payload: { student: savedStudent } });
            } catch (error) {

            }
        }else {
            state.lostConnection = true
            await saveStudentDBCallback(student)
        }
    }

    async function saveStudentCallback(student: StudentProps) {
        log("saveStudentCallback")

        try {
            //log("saveStudentCallback: bdstate-before save")
            //await bdState()
            //log("saveStudentCallback: student:", student)

            log('saveStudentCallback: saveStudent started');
            dispatch({ type: SAVE_STUDENT_CALLBACK_STARTED });
            //log(`saveStudent, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);

            student.sync = false
            await saveStudentDBCallback(student)

            log("saveStudentCallback student:", student);

            const savedStudent = await (student.id ? await updateStudent(token, student) : await createStudent(token, student));
            state.lostConnection = false
            log('saveStudentCallback: saveStudent succeeded');

            //log("saveStudentCallback: bdstate-after save")
            //await bdState()
            log("saveStudentCallback: ", students)

            dispatch({ type: SAVE_STUDENT_CALLBACK_SUCCEEDED})
        } catch (error) {
            log('saveStudentCallback: saveStudent failed');
            //log('saveStudent failed',error);
            if(error == "Error: Network Error"){
                log('saveStudentCallback: Error: Network Error', error == "Error: Network Error");

                student.sync=false
                state.lostConnection = true
                await saveStudentDBCallback(student)

                dispatch({ type: SAVE_STUDENT_CALLBACK_NETWORK_FAILED, payload: { error } })

                throw new Error("Network Error");
            }
            if(error == "Error: Request failed with status code 409"){
                log("saveStudentCallback: Error: Request failed with status code 409",error == "Error: Request failed with status code 409");

                student.sync=false
                state.lostConnection = false
                await saveStudentDBCallback(student)
                dispatch({ type: SAVE_STUDENT_CALLBACK_CONFLICT_FAILED, payload: { error } })

                throw new Error("Version Conflict");
            }

            student.sync=false
            state.lostConnection = true
            await saveStudentDBCallback(student)
            dispatch({ type: SAVE_STUDENT_CALLBACK_FAILED, payload: { error } })
        }
    }

    async function deleteStudentCallback(student: StudentProps) {
        try {
            log('deleteStudentCallback: deleteStudent started');
            dispatch({ type: DELETE_STUDENT_STARTED });
            const deletedStudent = await (removeStudent(token, student));
            log('deleteStudentCallback: deleteStudent succeeded');
            dispatch({ type: DELETE_STUDENT_SUCCEEDED, payload: { student: deletedStudent } });

            await deleteStudentDBCallback(student.id || "")

        } catch (error) {
            log('deleteStudentCallback: deleteStudent failed');
            dispatch({ type: DELETE_STUDENT_FAILED, payload: { error } });
            await deleteStudentDBCallback(student.id || "")
        }
    }

    function wsEffect() {
        log("wsEffect")
        let canceled = false;

        if(lostConnection == true){
            return;
        }

        const closeWebSocket = newWebSocket(token, async message => {
            log('wsEffect: wsEffect - onMessage');

            if (canceled) {
                return;
            }
            const {event, payload: student} = message;
            if (event === 'created' || event === 'updated') {
                log(`wsEffect: wsEffect created/updated, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment} ${student.version}`);
                //student.sync = true
                //log("wsEffect: bdstate-before save")
                //await bdState()
                log("wsEffect: ", students)

                dispatch({type: SAVE_STUDENT_WS_SUCCEEDED});

                //saveStudentDB(student)

                var studentTry:StudentProps = {name: student.name, graduated:student.graduated, grade:student.grade,
                    enrollment:student.enrollment, id:student.id, sync:true, version:student.version, studentPhotos:student.studentPhotos}

                //log("wsEffect: ",typeof student)
                //log("wsEffect: ",typeof studentTry)
                //log("wsEffect: ",student)
                //log("wsEffect: ",message.payload)

                await saveStudentDBCallback( studentTry)

                //log("wsEffect: bdstate-after save")
                //await bdState()
                log("wsEffect: ", students)
            }
            if (event === 'deleted') {
                log(`wsEffect: wsEffect deleted, student: ${student.name}  ${student.graduated}  ${student.grade}  ${student.enrollment}`);
                student.sync = true
                dispatch({type: DELETE_STUDENT_WS_SUCCEEDED});
                await deleteStudentDBCallback(student.id || "")
            }

        });
        return () => {
            log('wsEffect: wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }

    async function saveStudentDBCallback(student: StudentProps) {

        log('saveStudentDBCallback');

        log("saveStudentDBCallback: bdstate-before save")
        await bdState()
        log("saveStudentDBCallback: ", student)
        log("saveStudentDBCallback: ", JSON.stringify({
            student: student
        }))

        await (async () => {
            const { Storage } = Plugins;

            // Saving ({ key: string, value: string }) => Promise<void>
            await Storage.set({
                key: student.id || "",
                value: JSON.stringify({
                    student: student
                })
            });
        })();

        log("saveStudentDBCallback: bdstate-after save")
        await bdState()
        log("saveStudentDBCallback: ", students)

        //log('student is setted in local storage');
        await updateStudentsListCallback()
    }
    async function getStudentDBCallback(studentId: string) {
        log('getStudentDBCallback');
        var student:StudentProps
        student = await (async (studentId) => {
            const { Storage } = Plugins;

            // Loading value by key ({ key: string }) => Promise<{ value: string | null }>
            const res = await Storage.get({ key: studentId});
            if (res.value) {
                //log('Student found', JSON.parse(res.value));

                //log("muiuuuuuuuuuuuuuuuc", JSON.parse(res.value))
                let {student: student2} = JSON.parse(res.value)
                return student2

            } else {
                //log('Student not found');
            }

            //log('student is deleted from local storage');
        })(studentId);
        return student
    }
    async function deleteStudentDBCallback(studentId: string) {
        log('deleteStudentDBCallback');
        await (async (studentId) => {
            const {Storage} = Plugins;

            //log('Keys found before remove', await Storage.keys());
            // Removing value by key, ({ key: string }) => Promise<void>
            await Storage.remove({key: studentId});
            //log('Keys found after remove', await Storage.keys());

            await updateStudentsListCallback()
            log('deleteStudentDBCallback: student is deleted from local storage');
        })(studentId);
    }
    async function deleteStudentsDBCallback() {
        log('deleteStudentsDBCallback');
        await (async () => {
            const {Storage} = Plugins;

            const {keys} = await Storage.keys();
            keys.forEach(async (key) => {
                if (key != "token" && key != "photos") {
                    await deleteStudentDBCallback(key)
                }
            })

            log('deleteStudentsDBCallback: students are deleted from local storage');
        })();
    }
    async function updateStudentsListCallback() {
        log('updateStudentsListCallback');
        //log("updateStudentsListCallback: bdstate-before update")
        //await bdState()
        log("updateStudentsListCallback: ", students)

        await (async () => {
            const {Storage} = Plugins;

            var studentss: StudentProps[] = [];

            // Loading keys () => Promise<{ keys: string[] }>
            const {keys} = await Storage.keys();

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i]
                if(key != "token" && key != "photos") {
                    let student: StudentProps = await getStudentDBCallback(key)
                    studentss.push(student)
                }
            }

            log("I send this studentss:", {studentss})
            log("I send this studentss:", studentss)
            dispatch({type: UPDATE_STUDENTS_LIST, payload: {studentss}});
            log("updateStudentsListCallback: state.students is updated from local storage")
        })();

        //log("updateStudentsListCallback: bdstate-after update")
        //await bdState()
        log("updateStudentsListCallback: ", students)
    }

    async function bdState(){
        log('1bdState');
        await (async () => {
            const {Storage} = Plugins;

            var studentss: StudentProps[] = [];
            const {keys} = await Storage.keys();

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i]
                if(key != "token") {
                    let student: StudentProps = await getStudentDBCallback(key)
                    studentss.push(student)
                }
            }

            log("2BD state is:", {studentss})
            log("3BD state is:", studentss)

        })();
    }
};
