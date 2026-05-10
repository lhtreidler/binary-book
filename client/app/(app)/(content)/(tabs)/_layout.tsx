import { Tabs } from "expo-router";
import {
  AddIcon,
  Icon,
  MenuIcon,
  SettingsIcon,
  StarIcon,
} from "@/components/ui/icon";
import { ComponentProps } from "react";
import { Box } from "@/components/ui/box";

type IconAs = ComponentProps<typeof Icon>["as"];

const TabIcon = ({ as, color }: { as: IconAs; color: string }) => (
  <Icon as={as} size="lg" style={{ color }} />
);

export default function Index() {
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "#2563eb", headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon as={StarIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "List",
          tabBarIcon: ({ color }) => <TabIcon as={MenuIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Book",
          tabBarIcon: ({ color }) => <TabIcon as={AddIcon} color={color} />,
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
  );
}
