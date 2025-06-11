import BalanceItem from '@/app/components/BalanceItem';
import CalendarModal from '@/app/components/CalendarModal';
import HistoricList from '@/app/components/HistoricList/app';
import api from '@/app/services/api';
import { useIsFocused } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import { Area, Background, List, ListBalance, Title } from './styles';


export default function Home() {
  const isFocused = useIsFocused();
  const [listBalance, setListBalance] = React.useState<any[]>([]);
  const [dateMoviments, setDateMoviments] = React.useState(new Date());
  const [moviments, setMoviments] = React.useState<any[]>([]);
  const [modalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    let isActive = true;

    async function getMoviments() {
      let date = new Date(dateMoviments);
      let onlyDate = date.valueOf() + date.getTimezoneOffset() * 60 * 1000;
      let dateFormatted = format(onlyDate, 'dd/MM/yyyy');
      
      
      const receives = await api.get('/receives', {
        params: {
          date: dateFormatted
        }})

      const response = await api.get('/balance', {
        params: {
          date: dateFormatted
        }
      })
      
      if (isActive) {
        setMoviments(receives.data);
        setListBalance(response.data);
      }
    }

    getMoviments()

    return () => { isActive = false; };

  }, [isFocused, dateMoviments]);

  async function handleDeleteItem(id: string) {
    try{
      await api.delete(`/receives/delete`,{
        params: {
          item_id: id
        }
      });
      setDateMoviments(new Date()); // Refresh the list after deletion
    }catch (error) {
      console.log(error);
    }
  }

  function filterDateMoviments(date: Date) {
    setDateMoviments(date);
  }

  return (
    <Background>
      <Header title="Minhas movimentações" />
      <ListBalance
        data={listBalance}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item: any) => item.tag}
        renderItem={({ item }: any) => (
          <BalanceItem data={item} />
        )} />
      <Area>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="event" size={30} color="#121212" />
        </TouchableOpacity>
        <Title>Ultimas Movimentações</Title>
      </Area>

      <List
        data={moviments}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (<HistoricList data={item} deleteItem={handleDeleteItem}/>)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <CalendarModal 
          setVisible={ () => setModalVisible(false) }
          handleFilter={filterDateMoviments}
        />
      </Modal>
    </Background>
  );
}