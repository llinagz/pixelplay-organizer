import { ReactNode, useMemo } from "react";
import { useAccount, useDemoAuth, useIsAuthenticated } from "jazz-tools/react";
import { BacklogPixelAccount } from "@/schema";
import type { BacklogPixelRoot } from "@/schema";
import { createStrictContext } from "./createStrictContext";

interface AppDataSlice {
  demoAuth: ReturnType<typeof useDemoAuth>;
  root: BacklogPixelRoot | undefined;
  profileName?: string;
}

const [AppDataContext, useAppData] = createStrictContext<AppDataSlice>("useAppData");

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const demoAuth = useDemoAuth();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount(BacklogPixelAccount, {
    resolve: {
      profile: true,
      root: {
        tags: { $each: true },
        items: { $each: { tag: true } },
      },
    },
  });

  const isLoaded = isAuthenticated && account?.$isLoaded;
  const root = isLoaded ? account.root : undefined;
  const profileName = isLoaded && account.profile?.$isLoaded ? account.profile.name : undefined;

  const value = useMemo<AppDataSlice>(
    () => ({
      demoAuth,
      root,
      profileName,
    }),
    [demoAuth, root, profileName],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export { useAppData };
