import React from "react";

import { createDrawerNavigator } from "@react-navigation/drawer";

import Home from "../pages/Home/app";

const Drawer = createDrawerNavigator();
export default function AppRoutes() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        component={Home}
        // options={{
        //   headerShown: false,
        //   drawerLabel: "Home",
        // }}
      />
    </Drawer.Navigator>
  );
}