import Header from "@/app/components/Header";
import RegisterTypes from "@/app/components/RegisterTypes/app";
import api from "@/app/services/api";
import { format } from "date-fns";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { Alert, Keyboard, SafeAreaView, TouchableWithoutFeedback } from "react-native";
import { Background, Input, SubmitButon, SubmitText } from "./style";

export default function New() {

    const [labelInput, setLabelInput] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [type, setType] = useState('receita');
    const navigation = useNavigation();
    function handleSubmit() {
        Keyboard.dismiss();
        if (isNaN(parseFloat(valueInput)) || type === null) {
            alert('Preencha todos os campos');
            return;

        }
        Alert.alert(
            'Confirmando dados',
            `Tipo: ${type}\nNome: ${labelInput}\nValor: R$ ${parseFloat(valueInput)}`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Continuar',
                    onPress: () => {
                        handleRegister().finally(() => {
                            alert('CADASTRADO!');
                        })

                        // Aqui você pode adicionar a lógica para enviar os dados para o servidor ou armazená-los localmente
                    }
                }
            ]
        )
    }

    async function handleRegister() {
        Keyboard.dismiss();
        await api.post('/receive', {
            description: labelInput,
            value: Number(valueInput),
            type: type,
            date: format(new Date(), 'dd/MM/yyyy')
        })
        setLabelInput('');
        setValueInput('');
        navigation.navigate('Home' as never);
    }

    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
            <Background>
                <Header title="Registrando" />

                <SafeAreaView style={{ marginTop: 14, alignItems: 'center' }}>
                    <Input
                        placeholder="Descrição do registro"
                        value={labelInput}
                        onChangeText={(text) => { setLabelInput(text) }}
                    />
                    <Input
                        placeholder="Valor desejado"
                        keyboardType="numeric"
                        value={valueInput}
                        onChangeText={(text) => { setValueInput(text) }}
                    />
                    <RegisterTypes type={type} sendTypeChange={(item: any) => setType(item)} />

                    <SubmitButon onPress={handleSubmit}>
                        <SubmitText>Registrar</SubmitText>
                    </SubmitButon>

                </SafeAreaView>
            </Background>
        </TouchableWithoutFeedback>
    )
}