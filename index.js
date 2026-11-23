import App from './App';
import { AppRegistry, StatusBar, Platform } from 'react-native';
import React from 'react';
import { name as appName } from './app.json';

// --- PERSISTÊNCIA E BANCO ---
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { mySchema } from './src/models/schema';
import Blog from './src/models/Blog';
import Post from './src/models/Post';
import Profile from './src/models/Profile';
import Comment from './src/models/Comment';
import SpaceProfile from './src/models/SpaceProfile';

// --- REDUX ---
import { Provider } from 'react-redux';
import { store, persistor } from './src/store';
import { PersistGate } from 'redux-persist/integration/react';

// --- GESTURE HANDLER & NOTIFICATIONS ---
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import PushNotification from 'react-native-push-notification';

// --- NATIVE MODULES ---
import { NativeModules } from 'react-native';
import { Creators as SpaceActions } from './src/store/ducks/space';
import siaApi from './src/services/siaApi';
const { TimeController } = NativeModules;

// Configuração do WatermelonDB
const adapter = new SQLiteAdapter({
    dbName: 'GrowDB10',
    schema: mySchema,
});

const database = new Database({
    adapter,
    modelClasses: [SpaceProfile, Blog, Post, Comment, Profile],
});

const timeController = async () => {
    store.dispatch(SpaceActions.decreaseTime());
};

const timeControllerDaily = async () => {
    const latitude = -8.668639;
    const longitude = -37.682861;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    try {
        const resposta = await siaApi.eto(latitude, longitude, today, today, 200);
        if (resposta) {
            store.dispatch(SpaceActions.updateEto(resposta));
        }
    } catch (error) {
        console.log('ERRO ETO:', error);
    }
};

PushNotification.configure({
    onNotification: function () {},
    requestPermissions: Platform.OS === 'ios',
});

// Componente Raiz Envolvido com os Providers
const RNRedux = () => {
    // Inicializa os serviços nativos que você criou em Java/Kotlin
    if (TimeController) {
        TimeController.startService();
        TimeController.startDailyService();
    }

    return (
        <DatabaseProvider database={database}>
            <Provider store={store}>
                <StatusBar hidden={true} />
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        </DatabaseProvider>
    );
};

// Registro do App com suporte a Gestos e Headless JS Tasks
AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(RNRedux));
AppRegistry.registerHeadlessTask('timeController', () => timeController);
AppRegistry.registerHeadlessTask('dailyTaskController', () => timeControllerDaily);