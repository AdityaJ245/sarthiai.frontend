export type UserRole = "user" | "admin";

export type PublicUser = {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    displayName: string;
    bio: string;
    avatarUrl: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type Nutrition = {
  calories: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
};

export type Meal = {
  id: string;
  userId: string;
  title: string;
  notes: string;
  eatenAt: string;
  nutrition: Nutrition;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
