import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import SignIn from "../SignIn";
import SignUp from "../SignUp";

const AuthStack = createNativeStackNavigator();

export default function AuthRoutes() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen
        name="SignIn"
        component={SignIn}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp} />
    </AuthStack.Navigator>
  );
}   