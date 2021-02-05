import axios from 'axios';
import { getLogger } from '../core';
import { StudentProps } from './StudentProps';
import {ParticipationProps} from "./ParticipationProps";
import {ExamProps} from "./ExamProps";
import {OrderProps} from "./OrderProps";

const log = getLogger('StudentApi');

const baseUrl = 'localhost:3000';
const orderUrl = `http://${baseUrl}/item`;

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

export const createOrderApi: (order: OrderProps, user:String, value:Number) => Promise<OrderProps[]> =
    (order, user, value) => {
    return withLogs(axios.post(orderUrl, {name:order.name, value:value,
        user:user}, config), 'createParticipation');
}

export const getOrdersApi: (user:String) => Promise<OrderProps[]> = (user) => {
    return withLogs(axios.get(`${orderUrl}?postBy=${user}`, config), 'getExams');
}

export const getActiveOrdersApi: () => Promise<OrderProps[]> = () => {
    return withLogs(axios.get(`${orderUrl}?status=active`, config), 'getExams');
}

export const solveOrderApi: (order: OrderProps, totalPrice:number, user:string) => Promise<ParticipationProps[]> = (order, totalPrice ,user)=> {
    return withLogs(axios.patch(`${orderUrl}/${order.id}`, {totalPrice:totalPrice, status:'done', boughtBy:user}, config), 'updateParticipation');
}


interface MessageData {
    payload: {
        order: OrderProps;
    };
}

export const newWebSocket = (onMessage: (data: any) => void) => {
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

        log("ApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApiApi")
        const message = JSON.parse(messageEvent.data);
        const { event, payload: item } = message;
        log(message);
        log(event);
        log(item);

        const order: OrderProps = message as OrderProps;
        log(order.id);

        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
