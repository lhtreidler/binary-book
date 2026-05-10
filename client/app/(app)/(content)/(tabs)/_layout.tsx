import { Tabs } from "expo-router";
import { Icon, MenuIcon, SettingsIcon, StarIcon } from "@/components/ui/icon";
import { ComponentProps } from "react";
import { View } from "react-native";
import { BookAutocomplete } from "@/components/book-autocomplete";

type IconAs = ComponentProps<typeof Icon>["as"];

const TabIcon = ({ as, color }: { as: IconAs; color: string }) => (
  <Icon as={as} size="lg" style={{ color }} />
);

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <BookAutocomplete />
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#2563eb",
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <TabIcon as={StarIcon} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="list"
            options={{
              title: "List",
              tabBarIcon: ({ color }) => (
                <TabIcon as={MenuIcon} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color }) => (
                <TabIcon as={SettingsIcon} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
