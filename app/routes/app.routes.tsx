import React from "react";

import { createDrawerNavigator } from "@react-navigation/drawer";

import CustomerDrawer from "../components/CostumerDrawer/app";
import Home from "../pages/Home/app";
import New from "../pages/New/app";
import Profile from "../pages/Profile/app";

const Drawer = createDrawerNavigator();
export default function AppRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomerDrawer {...props}/> }
      screenOptions={{
        headerShown: false,
        drawerStyle:{
          backgroundColor: "#fff",
          paddingTop:20,
        },
        drawerActiveBackgroundColor:"#3b3dbf",
        drawerActiveTintColor:"#fff",
        drawerInactiveBackgroundColor: '#f0f2ff',
        drawerInactiveTintColor:"#121212",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}        
      />
      <Drawer.Screen
        name="New"
        component={New} 
      />
        <Drawer.Screen
        name="Perfil"
        component={Profile} 
      />
      
    </Drawer.Navigator>
  );
}