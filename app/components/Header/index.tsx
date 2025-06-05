import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { ButtonMenu, Container, Text } from './styles';

export default function Header({ title }: { title?: string }) {
  const navigation = useNavigation();
  return (
    <Container>
      <ButtonMenu onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Icon name='menu' size={35} color="#121212"></Icon> 
      </ButtonMenu>
      {title && <Text>{title}</Text>}
    </Container>
  );
}