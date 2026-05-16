import * as SplashScreen from "expo-splash-screen";
import { useIsLoggedIn } from "@/lib/api/hooks/useAuth";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export function SplashScreenController() {
  const { isLoading } = useIsLoggedIn();

  if (!isLoading) {
    SplashScreen.hide();
  }

  return null;
}
