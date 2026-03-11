import { create } from "zustand";
import { persist } from "zustand/middleware";
import { userProfile } from "./mockData";

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: "masse" | "seche" | "maintien" | "force";
  macros: { protein: number; carbs: number; fat: number; kcal: number };
  waterGoal: number;
  measurements: { arms: number; thighs: number; waist: number; hips: number };
}

interface UserStore {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: {
        name: userProfile.name,
        age: userProfile.age,
        height: userProfile.height,
        weight: userProfile.weight,
        goal: userProfile.goal,
        macros: userProfile.macros,
        waterGoal: userProfile.waterGoal,
        measurements: userProfile.measurements,
      },
      setProfile: (profile) => set({ profile }),
    }),
    { name: "user-profile" }
  )
);
