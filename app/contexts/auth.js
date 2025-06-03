import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import React, { createContext, useEffect, useState } from "react";
import api from "../services/api";


export const AuthContext = createContext({
    signUp: (email, senha, nome) => { },
    signIn: (email, senha) => { },
    signOut: () => { },
    loadingAuth: false,
    signed: false,
    loading: true,
    user: {}
});



function AuthProvider({ children }) {

    const [user, setUser] = useState({})
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        async function loadStorage() {
            const token = await AsyncStorage.getItem('@finToken');
            if (token) {
                const response = await api.get('/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .catch(err => {
                        console.error("Error ao carregar usuário", err);
                        setUser(null);
                        setLoading(false);
                    })
                api.defaults.headers['Authorization'] = `Bearer ${token}`;
                setUser(response.data);
                setLoading(false);
            }
            setLoading(false);
        }
        loadStorage();
    }, []);

    async function signUp(email, password, nome) {
        setLoadingAuth(true)
        try {
            await api.post('/users', {
                email: email,
                password: password,
                name: nome
            });
            setLoadingAuth(false);
            navigation.goBack();

        } catch (err) {
            setLoadingAuth(false);
            console.error("Error ao cadastrar", err);
        }
    }

    async function signIn(email, password) {
        setLoadingAuth(true);
        try {
            const response = await api.post('/login', {
                email: email,
                password: password
            });
            const { id, name, token } = response.data;

            await AsyncStorage.setItem('@finToken', token);

            api.defaults.headers['Authorization'] = `Bearer ${token}`;
            setUser({ id, name, email });
            setLoadingAuth(false);
        } catch (err) {
            console.error("Error ao logar", err);
            setLoadingAuth(false);

        }
    }

    async function signOut() {
        await AsyncStorage.clear()
            .then(() => {
                setUser(null);
            })
        //api.defaults.headers['Authorization'] = null;
        //navigation.navigate('login');
    }
    return (
        <AuthContext.Provider value={{ signed: !!user, user, signUp, signIn, signOut, loadingAuth, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;