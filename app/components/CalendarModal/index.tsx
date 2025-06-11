import React from "react";

import { TouchableWithoutFeedback, View } from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ptBR } from './localeCalendar';
import { ButtonFilter, ButtonFilterText, Container, ModalContent } from "./styles";

LocaleConfig.locales['pt-br'] = ptBR;
LocaleConfig.defaultLocale = 'pt-br';

interface CalendarModalProps {
    setVisible: () => void;
    handleFilter: any;
}
export default function CalendarModal({setVisible, handleFilter }: CalendarModalProps) {

    const [dateNow, setDateNow] = React.useState(new Date());
    const [markedDates, setMarkedDates] = React.useState({});
    // <{ [key: string]: { marked: boolean } }>

    function handleOnDayPress(day: { dateString: string }) {
              
        setDateNow(new Date(day.dateString));
        let  markedDay: any = {};

        markedDay[day.dateString] = { 
            selected: true,
            selectedColor: '#3d3dbf',
            textColor: '#fff', 
            marked: true, 
        };
        setMarkedDates(markedDay)
    }
    function handleFilterDate(){
        handleFilter(dateNow)
        setVisible();
    }
    return (
        <Container>
            <TouchableWithoutFeedback onPress={setVisible}>
                <View style={{ flex: 1 }} ></View>
            </TouchableWithoutFeedback>

            <ModalContent>
                <Calendar 
                    onDayPress={handleOnDayPress}
                    markedDates={markedDates}
                    enableSwipeMonths={true}
                    theme={{
                        todayTextColor: "#ff0000",
                        selectedDayBackgroundColor: "#00adf5",
                        selectedDayTextColor: "#fff",
                        }}
                />
                <ButtonFilter onPress={handleFilterDate}>
                    <ButtonFilterText>Filtrar</ButtonFilterText>
                </ButtonFilter>
            </ModalContent>
        </Container>
    );
}