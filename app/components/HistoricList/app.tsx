import React from "react";

import { Alert, TouchableWithoutFeedback } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Container, IconView, Text, Tipo, ValorText } from "./styles";

export default function HistoricList(props: any) {

  function handleDeleteItem() {
    Alert.alert(
      "Atenção",
      "Você deseja excluir este item?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Continuar",
          onPress: () => props.deleteItem(props.data.id),
          style: "destructive"
        }
      ],
      { cancelable: false }
    )
  }
  return (
    <TouchableWithoutFeedback onLongPress={() => { handleDeleteItem(); }}>
      <Container>
        <Tipo>
          <IconView style={{ backgroundColor: props.data.type === 'receita' ? '#049301' : '#c62c36' }}>
            <Icon name={props.data.type === 'receita' ? 'arrow-up' : 'arrow-down'} size={20} color={"#fff"} />
            <Text>{props.data.type}</Text>
          </IconView>
        </Tipo>
        <ValorText>
          R$ {props.data.value},00
        </ValorText>
      </Container>
    </TouchableWithoutFeedback>
  );
}
