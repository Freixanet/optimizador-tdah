import type { User } from '@supabase/supabase-js';

export type CloudUserProfile = {
  email?: string | null;
  avatarUrl?: string | null;
};

export function toCloudUserProfile(user: User): CloudUserProfile {
  const metadata = user.user_metadata ?? {};
  const avatarUrl =
    (typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
    (typeof metadata.picture === 'string' && metadata.picture) ||
    null;

  return {
    email: user.email,
    avatarUrl,
  };
}
