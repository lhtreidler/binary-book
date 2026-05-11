import { Tabs, usePathname } from "expo-router";
import {
  FavouriteIcon,
  Icon,
  MenuIcon,
  StarIcon,
  UserIcon,
} from "@/components/ui/icon";
import { ComponentProps } from "react";
import { View } from "react-native";
import { BookAutocomplete } from "@/components/book-autocomplete";

type IconAs = ComponentProps<typeof Icon>["as"];

const TabIcon = ({ as, color }: { as: IconAs; color: string }) => (
  <Icon as={as} size="lg" style={{ color }} />
);

const tabs = [
  { name: "index", title: "Home", icon: StarIcon },
  { name: "list", title: "List", icon: MenuIcon },
  { name: "community", title: "Community", icon: FavouriteIcon },
  { name: "profile/index", title: "Profile", icon: UserIcon },
] as const;

export default function TabLayout() {
  const pathname = usePathname();

  const isAutocompleteSticky = pathname === "/community";
  const isAutocompleteShown = pathname !== "/settings";

  return (
    <View style={{ flex: 1 }}>
      {isAutocompleteShown && (
        <BookAutocomplete isSticky={isAutocompleteSticky} />
      )}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#2563eb",
            headerShown: false,
          }}
        >
          {tabs.map(({ name, title, icon }) => (
            <Tabs.Screen
              key={name}
              name={name}
              options={{
                title,
                tabBarIcon: ({ color }) => <TabIcon as={icon} color={color} />,
              }}
            />
          ))}
          <Tabs.Screen name="profile/[friendId]" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}
