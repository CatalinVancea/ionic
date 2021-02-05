import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonItem, IonLabel} from "@ionic/react";
import React, {useContext} from "react";
import { RouteComponentProps } from "react-router";
import {getLogger} from "../core";
import {AuthContext} from "../auth";

const log = getLogger('HomePage');


const HomePage: React.FC<RouteComponentProps> = ({ history }) => {
    const { logout, token} = useContext(AuthContext);
    log("tokeeeeen",token);
    return (
        <IonPage id="HomePage">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>App</IonTitle>

                    <IonLabel>
                        {token}
                    </IonLabel>

                    <IonButton color="primary" onClick={() => {
                        log("tokeeeeen",token);
                        log("try to logout");
                        logout?.()
                        history.push('/login')}}>
                        Logout
                    </IonButton>

                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonButton onClick={() => { history.push('/post-order') }}>Post Order</IonButton>
                <IonButton onClick={() => { history.push('/solve-order') }}>Solve Order</IonButton>
            </IonContent>
        </IonPage>
    );
};

export default HomePage;