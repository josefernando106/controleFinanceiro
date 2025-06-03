import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import SignIn from "../pages/SignIn/app";
import SignUp from "../pages/SignUp/app";

const AuthStack = createNativeStackNavigator();

export default function AuthRoutes() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="SignIn"
        component={SignIn}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp} 
        options={{
          headerStyle:{
            backgroundColor: '#3b3bdf',
          },
          headerTintColor: '#fff',
          headerTitle: 'Voltar',
        }}
        />
    </AuthStack.Navigator>
  );
}   