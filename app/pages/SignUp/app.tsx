import React, { useContext, useState } from "react";

import { AuthContext } from "@/app/contexts/auth";
import { ActivityIndicator } from "react-native";
import {
    AreaInput,
    Background,
    Container,
    Input,
    SubmitButton,
    SubmitText,
} from "../SignIn/styles";

export default function SignUp() {

    const { signUp, loadingAuth } = useContext(AuthContext);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    function handleSignUp() {
        if (nome === '' || email === '' || senha === '') return

        signUp(email, senha, nome)
    }
    return (
        <Background>
            <Container>
                <AreaInput>
                    <Input
                        placeholder="Seu Nome"
                        value={nome}
                        onChangeText={(text) => setNome(text)}
                    />
                </AreaInput>
                <AreaInput>
                    <Input
                        placeholder="Seu Email"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                    />
                </AreaInput>
                <AreaInput>
                    <Input
                        placeholder="Sua senha"
                        secureTextEntry={true}
                        value={senha}
                        onChangeText={(text) => setSenha(text)}
                    />
                </AreaInput>
                <SubmitButton activeOpacity={0.7} onPress={handleSignUp}>
                    {
                        loadingAuth ? (
                            <ActivityIndicator size={20} color='#fff' />
                        ) : (
                            <SubmitText>Cadastrar</SubmitText>
                        )
                    }
                </SubmitButton>

            </Container>
        </Background>

    );
}
