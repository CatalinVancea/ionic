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
    IonButton
} from '@ionic/react';
import { add, removeCircle, reload} from 'ionicons/icons';
import { getLogger } from '../core';
import { OrderContext } from "./OrdersProvider";
import Order from "./Order";
import {OrderProps} from "./OrderProps";

const log = getLogger('PostStudent');

export const PostStudent: React.FC<RouteComponentProps> = ({ history }) => {
    const { orders, fetching, fetchingError, saving, savingError, createOrder} = useContext(OrderContext);

    const [name, setName] = useState('');
    const [value, setValue] = useState(Number());
    const [order, setOrder] = useState<OrderProps>();

    const handleSave = () => {
        log('handleSave entry');
        const editedOrder = order ? { ...order, name} : { name};
        createOrder && createOrder(editedOrder, value).then();
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
                    <IonItem>
                        <IonLabel>Order Name</IonLabel>
                        <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Order Value</IonLabel>
                        <IonInput type="number" value={value} placeholder="Enter Number" onIonChange={e => setValue(parseInt(e.detail.value!, 10))}></IonInput>
                    </IonItem>

                    <IonLoading isOpen={saving} />
                    {savingError && (
                        <div>{savingError.message || 'Failed to save student'}</div>
                    )}

                    <IonButton onClick={handleSave}>
                        Save
                    </IonButton>
                </div>


                <IonLoading isOpen={fetching} message="Fetching students" />
                {orders && (
                    <IonList>
                        {orders.map(({ id, name, totalPrice,
                                         status, boughtBy,quantity}) =>
                                <Order key={id} id={id} name={name} status={status}
                                       boughtBy={boughtBy} quantity={quantity}
                                       totalPrice={totalPrice}/>
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

export default PostStudent;
