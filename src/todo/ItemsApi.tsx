import axios from 'axios';
import { getLogger } from '../core';
import { StudentProps } from './StudentProps';
import {ParticipationProps} from "./ParticipationProps";
import {ExamProps} from "./ExamProps";

const log = getLogger('StudentApi');

const baseUrl = 'localhost:3000';
const examUrl = `http://${baseUrl}/exam`;
const participationUrl = `http://${baseUrl}/participation`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getExams: () => Promise<ExamProps[]> = () => {
    return withLogs(axios.get(examUrl, config), 'getExams');
}

export const getParticipations: () => Promise<ParticipationProps[]> = () => {
    return withLogs(axios.get(participationUrl, config), 'getParticipations');
}

export const createParticipation: (participation: ParticipationProps) => Promise<ParticipationProps[]> = participation => {
    return withLogs(axios.post(participationUrl, participation, config), 'createParticipation');
}

export const updateParticipation: (participation: ParticipationProps) => Promise<ParticipationProps[]> = participation => {
    return withLogs(axios.patch(`${participationUrl}/${participation.id}`, participation, config), 'updateParticipation');
}

interface MessageData {
    payload: {
        participation: ParticipationProps;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');

        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
