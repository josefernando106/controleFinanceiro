import { useNavigation } from 'expo-router';
import React, { useContext, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { AuthContext } from '../../contexts/auth';
import { AreaInput, Background, Container, Input, Link, LinkText, Logo, SubmitButton, SubmitText } from './styles';

export default function SignIn() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {loadingAuth, signIn} = useContext(AuthContext)

    function handleSignIn() {
        signIn(email, password);
    }

    return (
        <Background>

            <Container>
                <Logo source={require('../../../assets/images/Logo.png')} />
                <AreaInput>
                    <Input
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        placeholder="Seu Email" />
                </AreaInput>
                <AreaInput>
                    <Input
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        secureTextEntry={true}
                        placeholder="Sua senha" />
                </AreaInput>
                <SubmitButton activeOpacity={0.7} onPress={handleSignIn} disabled={loadingAuth}>
                    {loadingAuth ? (
                        <ActivityIndicator size={25} color={'#fff'}/>
                    ) : (
                        <SubmitText>Acessar</SubmitText>
                    )}
                    
                </SubmitButton>
                <Link onPress={() => { navigation.navigate('SignUp' as never) }}>
                    <LinkText>Criar uma Conta!</LinkText>
                </Link>
            </Container>

        </Background>
    );
}