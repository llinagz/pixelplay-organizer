import { ReactNode, useMemo } from "react";
import { useAuthActions, useOnboardingActions } from "@/context/services";
import type { AuthSlice } from "@/context/types";
import { createStrictContext } from "./createStrictContext";
import { useAppData } from "./AppDataContext";

const [AuthContext, useAuthSlice] = createStrictContext<AuthSlice>("useAuthSlice");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { demoAuth, root, profileName } = useAppData();
  const { completeOnboarding } = useOnboardingActions(root);
  const { logOut } = useAuthActions();

  const value = useMemo<AuthSlice>(
    () => ({
      authState: demoAuth.state,
      nombreUsuario: profileName,
      onboardingCompletado: root?.onboardingCompletado ?? false,
      signUp: demoAuth.signUp,
      logIn: demoAuth.logIn,
      existingUsers: demoAuth.existingUsers,
      completeOnboarding,
      logOut,
    }),
    [demoAuth, profileName, root, completeOnboarding, logOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthState = () => {
  const { authState, nombreUsuario, onboardingCompletado, existingUsers } = useAuthSlice();
  return { authState, nombreUsuario, onboardingCompletado, existingUsers };
};

export const useAuthActionsState = () => {
  const { signUp, logIn, completeOnboarding, logOut } = useAuthSlice();
  return { signUp, logIn, completeOnboarding, logOut };
};
