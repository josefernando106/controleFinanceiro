import React from "react";

import Feather from "react-native-vector-icons/Feather";
import { RegisterContainer, RegisterLabel, RegisterTypeButon } from "./style";

export default function RegisterTypes({type, sendTypeChange}: any) {

    const [typeChecked, setTypeChecked] = React.useState(type);

    function changeType(newType: string) {
        setTypeChecked(newType);
        sendTypeChange(newType);
    }
  return (
    <RegisterContainer>
        <RegisterTypeButon 
            checked={typeChecked === 'receita' ? true : false}
            onPress={() => changeType('receita')}
        >
            <Feather name="arrow-up" size={25} color={"#121212"} />
            <RegisterLabel>
                Receita
            </RegisterLabel>
        </RegisterTypeButon>

         <RegisterTypeButon 
         checked={typeChecked === 'despesa' ? true : false}
         onPress={() => changeType('despesa')}>
            <Feather name="arrow-down" size={25} color={"#121212"} />
            <RegisterLabel>
                Despesa
            </RegisterLabel>
        </RegisterTypeButon>
    
    </RegisterContainer>
  );
}