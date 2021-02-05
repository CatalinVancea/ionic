import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import {createOrderApi, getOrdersApi, newWebSocket, solveOrderApi} from "./OrderApi";
import {OrderProps} from "./OrderProps";
import {AuthContext} from "../auth";
import {StudentProps} from "./StudentProps";

const log = getLogger('OrderProvider');

type CreateOrderFn = (order: OrderProps, value:number) => Promise<any>;
type SolveOrderFn = (order: OrderProps, totalPrice:number, token:string) => Promise<any>;

export interface OrdersState {
    
    orders?: OrderProps[],

    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    createOrder?: CreateOrderFn,
    solveOrder?: SolveOrderFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: OrdersState = {
    fetching: false,
    saving: false,
};

const FETCH_ORDERS_STARTED = 'FETCH_ORDERS_STARTED';
const FETCH_ORDERS_SUCCEEDED = 'FETCH_ORDERS_SUCCEEDED';
const FETCH_ORDERS_FAILED = 'FETCH_ORDERS_FAILED';

const SAVE_ORDER_STARTED = 'SAVE_ORDER_STARTED';
const SAVE_ORDER_SUCCEEDED = 'SAVE_ORDER_SUCCEEDED';
const SAVE_ORDER_FAILED = 'SAVE_ORDER_FAILED';


const reducer: (state: OrdersState, action: ActionProps) => OrdersState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ORDERS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ORDERS_SUCCEEDED:
                return { ...state, orders: payload.orders, fetching: false };
            case FETCH_ORDERS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ORDER_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ORDER_SUCCEEDED:

                const orders = [...(state.orders || [])];
                const order = payload.order;
                const index = orders.findIndex(it => it.id === order.id);
                if (index === -1) {
                    orders.splice(0, 0, order);
                } else {
                    log(`reducer, order: ${order.id}  ${order.name}  ${order.status}`);
                    orders[index] = order;
                }
                return { ...state, orders, saving: false };
            case SAVE_ORDER_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const OrderContext = React.createContext<OrdersState>(initialState);

interface OrdersProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const OrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { orders, fetching, fetchingError, saving, savingError } = state;
    const { token } = useContext(AuthContext);
    useEffect(getOrdersEffect, []);
    useEffect(wsEffect, []);
    const createOrder = useCallback<CreateOrderFn>(createOrderCallback, []);
    const solveOrder = useCallback<SolveOrderFn>(solveOrderCallback, []);
    const value = { orders, fetching, fetchingError, saving, savingError, createOrder, solveOrder};
    log('returns');

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );

    function getOrdersEffect() {
        let canceled = false;
        fetchOrders();
        return () => {
            canceled = true;
        }

        async function fetchOrders() {
            try {
                log('fetchOrders started');
                dispatch({ type: FETCH_ORDERS_STARTED });
                const orders = await getOrdersApi(token);
                log('fetchOrders succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ORDERS_SUCCEEDED, payload: { orders } });
                }
            } catch (error) {
                log('fetchOrders failed');
                dispatch({ type: FETCH_ORDERS_FAILED, payload: { error } });
            }
        }
    }

    async function createOrderCallback(order: OrderProps, value: number) {
        try {
            log('saveOrder started');
            dispatch({ type: SAVE_ORDER_STARTED });
            const savedOrder = await createOrderApi(order, token, value);
            log('saveOrder succeeded');
            dispatch({ type: SAVE_ORDER_SUCCEEDED, payload: { order: savedOrder } });
        } catch (error) {
            log('saveOrder failed');
            dispatch({ type: SAVE_ORDER_FAILED, payload: { error } });
        }
    }

    async function solveOrderCallback(order: OrderProps, totalPrice: number, token:string) {
        try {
            log('saveOrder started');
            dispatch({ type: SAVE_ORDER_STARTED });
            log('tokeeeeeeeeeeeeeeeeen',token);
            const savedOrder = await solveOrderApi(order, totalPrice, token);
            log('saveOrder succeeded');
            dispatch({ type: SAVE_ORDER_SUCCEEDED, payload: { order: savedOrder } });
        } catch (error) {
            log('saveOrder failed');
            dispatch({ type: SAVE_ORDER_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(async (payload) => {
            if (canceled) {
                return;
            }

            const order: OrderProps = payload as OrderProps;



            //var orderTry:OrderProps = {id:order.id || "", name:order.name}


            log(`ws message, order id ${order.id}`);

            dispatch({ type: SAVE_ORDER_SUCCEEDED, payload: { order } });
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
