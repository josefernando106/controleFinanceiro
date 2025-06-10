import React from "react";

import Header from "@/app/components/Header";
import {
    Container,
    LogoutButton,
    LogoutText,
    Message,
    Name,
    NameLink,
    NewText,
    View
} from "./styles";

import { AuthContext } from "@/app/contexts/auth";

import { useNavigation } from "expo-router";


export default function Profile() {

    const { user, signOut } = React.useContext(AuthContext);
    const navigate = useNavigation();
    return (
        <View>

        <Header title="Meu Perfil" />
        <Container>
            <Message>Hey, bem vindo de volta! </Message>

            <Name numberOfLines={1}>
                {user && user?.name}
            </Name>

            <NameLink onPress={() => navigate.navigate("New" as never)}>
                <NewText>Fazer registro</NewText>
            </NameLink>

            <LogoutButton onPress={() => signOut()}>
                <LogoutText>Sair</LogoutText>
            </LogoutButton>

        </Container>
        </View>

    );
}