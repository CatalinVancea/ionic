import React, {useContext, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonToggle,
    IonItemDivider,
    IonDatetime,
    IonInput,
    IonButton,
    IonModal
} from '@ionic/react';
import { add, removeCircle, reload} from 'ionicons/icons';
import { getLogger } from '../core';
import { OrderContext } from "./OrdersProvider";
import {OrderProps} from "./OrderProps";
import Order from "./Order";
import {AuthContext} from "../auth";


const log = getLogger('PostStudent');

export const SolveStudent: React.FC<RouteComponentProps> = ({ history }) => {
    const { orders, fetching, fetchingError, saving, savingError, createOrder, solveOrder} = useContext(OrderContext);

    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [value, setValue] = useState(Number());
    const [totalPrice, setTotalPrice] = useState(Number());
    const [showModal, setShowModal] = useState(false);
    const [order, setOrder] = useState<OrderProps>();
    const { token } = useContext(AuthContext);

    const handleSolve = () => {
        log('handleSave entry');
        const editedOrder = order ? { ...order, id, name} : { id, name};
        solveOrder && solveOrder(editedOrder, value, token).then();
    };

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>

                <div>
                    <IonModal isOpen={showModal} cssClass='my-custom-class'>
                        <p>This is modal content</p>

                        <IonItem>
                            <IonLabel>Order Value</IonLabel>
                            <IonInput type="number" value={totalPrice} placeholder="Enter Number" onIonChange={e => setTotalPrice(parseInt(e.detail.value!, 10))}></IonInput>
                        </IonItem>

                        <IonButton onClick={() => {
                            handleSolve()
                            setShowModal(false)}
                        }>Close Modal</IonButton>
                    </IonModal>
                </div>

                <IonLoading isOpen={fetching} message="Fetching students" />
                {orders && (
                    <IonList>
                        {orders.map(({ id, name, totalPrice,
                                         status, boughtBy,quantity}) =>
                            <div onClick={()=>{
                                setId(id||"")
                                setName(name||"")
                                setShowModal(true)
                            }}>
                                <Order key={id} id={id} name={name} status={status}
                                       boughtBy={boughtBy} quantity={quantity}
                                       totalPrice={totalPrice} />
                            </div>
                        )}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch orders'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/student')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default SolveStudent;
