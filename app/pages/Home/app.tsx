    import React, { useContext } from 'react';
import { Button, Text, View } from 'react-native';
import { AuthContext } from '../../contexts/auth';

export default function Home() {
    const { signOut, user } = useContext(AuthContext);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Page</Text>
      <Button 
        title='Sair'
        onPress={() => signOut()}
      />
    </View>
  );
}