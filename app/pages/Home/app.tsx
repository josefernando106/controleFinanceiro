import BalanceItem from '@/app/components/BalanceItem';
import api from '@/app/services/api';
import { useIsFocused } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import Header from '../../components/Header';
import { Background, ListBalance } from './styles';

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
      data ={listBalance}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item: any) => item.tag}
      renderItem={({ item }: any) => (
        <BalanceItem data={item}/>
      )   }>

      </ListBalance>
    </Background>
  );
}