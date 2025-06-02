import React from 'react';
import { AreaInput, Background, Container, Input, Logo } from './styles';

export default function SignIn() {

    return (
        <Background>

            <Container>
                <Logo source={require('../../assets/images/Logo.png')} />
                <AreaInput>
                    <Input
                        placeholder="Seu Email" />
                </AreaInput>
                 <AreaInput>
                    <Input
                        placeholder="Sua senha" />
                </AreaInput>
            </Container>

        </Background>
    );
}