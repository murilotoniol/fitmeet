export type Achievement = {
  id: string;
  name: string;
  criterion: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  avatar: string | null;
  xp: number;
  level: number;
};

export type UserProfile = User & {
  achievements: Achievement[];
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ActivityType = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type ActivityAddress = {
  latitude: number;
  longitude: number;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
};

export type ActivityCreator = {
  id: string;
  name: string;
  avatar: string | null;
};

export type ParticipationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHECKED_IN';

export type Activity = {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
  confirmationCode: string | null;
  participantCount: number;
  address: ActivityAddress;
  scheduledDate: string;
  createdAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  isPrivate: boolean;
  creator: ActivityCreator;
  userSubscriptionStatus: ParticipationStatus | null;
};

export type ActivityPage = {
  page: number;
  pageSize: number;
  totalActivities: number;
  totalPages: number;
  previous: number | null;
  next: number | null;
  activities: Activity[];
};

export type Participant = {
  id: string;
  user: User;
  approved: boolean | null;
  checkedIn: boolean | null;
  registeredAt: string;
};

export type Preference = {
  typeId: string;
  typeName: string;
  typeDescription: string;
};

export type MessageResponse = {
  message: string;
};

export type ErrorResponse = {
  error: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
};

export type ImageAsset = {
  uri: string;
  type: string;
  fileName: string;
};

export type CreateActivityPayload = {
  title: string;
  description: string;
  typeId: string;
  image: ImageAsset;
  scheduledDate: string;
  isPrivate: boolean;
  address: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    latitude: number;
    longitude: number;
  };
};

export type UpdateActivityPayload = Partial<CreateActivityPayload>;
