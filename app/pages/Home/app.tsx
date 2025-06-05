import BalanceItem from '@/app/components/BalanceItem';
import HistoricList from '@/app/components/HistoricList/app';
import api from '@/app/services/api';
import { useIsFocused } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import { Area, Background, List, ListBalance, Title } from './styles';

export default function Home() {
  const isFocused = useIsFocused();
  const [listBalance, setListBalance] = React.useState<any[]>([]);
  const [dateMoviments, setDateMoviments] = React.useState(new Date());

  useEffect(() => {
    let isActive = true;

    async function getMoviments() {
      let dateFormatted = format(dateMoviments, 'dd/MM/yyyy');
      const response = await api.get('/balance', {
        params: {
          date: dateFormatted
        }
      })
      console.log(response.data);
      if (isActive) {
        setListBalance(response.data);
      }
    }

    getMoviments()

    return () => { isActive = false; };

  }, [isFocused]);

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
        <TouchableOpacity onPress={() => { }}>
          <Icon name="event" size={30} color="#121212" />
        </TouchableOpacity>
        <Title>Ultimas Movimentações</Title>
      </Area>

      <List
        data={[]}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (<HistoricList />)}
        showsVerticalScrollIndicator={false}
      />


    </Background>
  );
}