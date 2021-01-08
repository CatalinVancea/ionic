import axios from 'axios';
import { StudentProps } from './StudentProps';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { Plugins } from "@capacitor/core";
const { Storage } = Plugins;

const log = getLogger('StudentApi');

const studentUrl = `http://${baseUrl}/api/student`;

export const getStudents: (token: string) => Promise<StudentProps[]> = token => {
    var result = axios.get(studentUrl, authConfig(token))

    result.then(async result => {
        for (const student of result.data) {
            await Storage.set({
                key: student.id!,
                value: JSON.stringify({
                    id: student.id,
                    name: student.name,
                    grade: student.grade,
                    graduated: student.graduated,
                    enrollment: student.enrollment,
                    version: student.version
                }),
            });
        }
    });

    return withLogs(result, 'getStudents');
}

export const getStudentsPaging: (token: string) => Promise<StudentProps[]> = token => {
    return withLogs(axios.get(`${studentUrl}/paging`, authConfig(token)), 'getStudents');
}

export const createStudent: (token: string, student: StudentProps) => Promise<StudentProps[]> = (token, student) => {
    var result = axios.post(studentUrl, student, authConfig(token))

    result.then(async result => {
        var student = result.data
        await Storage.set({
            key: student.id!,
            value: JSON.stringify({
                id: student.id,
                name: student.name,
                grade: student.grade,
                graduated: student.graduated,
                enrollment: student.enrollment,
                version: student.version
            }),
        });
    });

    return withLogs(result, 'createStudent');
}

export const updateStudent: (token: string, student: StudentProps) => Promise<StudentProps[]> = (token, student) => {

    var result = axios.put(`${studentUrl}/${student.id}`, student, authConfig(token))

        result.then(async result => {
        var student = result.data
        await Storage.set({
            key: student.id!,
            value: JSON.stringify({
                id: student.id,
                name: student.name,
                grade: student.grade,
                graduated: student.graduated,
                enrollment: student.enrollment,
                version: student.version
                }),
            });
        });

    return withLogs(result, 'updateStudent');
}

export const removeStudent: (token: string, student: StudentProps) => Promise<StudentProps[]> = (token, student) => {
    return withLogs(axios.delete(`${studentUrl}/${student.id}`, authConfig(token)), 'deleteStudent');
}

export const getStudent: (token: string, student: StudentProps) => Promise<StudentProps> = (token, student) => {
    return withLogs(axios.get(`${studentUrl}/${student.id}`, authConfig(token)), 'getStudent');
}


interface MessageData {
    event: string;
    payload: StudentProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');

    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');

        log("ApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApi")
        const message = JSON.parse(messageEvent.data);
        const { event, payload: item } = message;
        log(message);
        log(event);
        log(item);
        log(item.name);

        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
