import { useEffect, useState } from 'react';

type ProfileAvatarProps = {
  email?: string | null;
  avatarUrl?: string | null;
  signedIn?: boolean;
};

export default function ProfileAvatar({ email, avatarUrl, signedIn = false }: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initial = email?.[0]?.toUpperCase() ?? 'M';
  const showPhoto = Boolean(signedIn && avatarUrl && !imageError);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  return (
    <div
      className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${
        showPhoto
          ? 'bg-neutral-200 dark:bg-neutral-800'
          : 'bg-gradient-to-br from-indigo-500 to-violet-600'
      }`}
    >
      {showPhoto ? (
        <img
          src={avatarUrl!}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-xs font-bold text-white leading-none">{initial}</span>
      )}
    </div>
  );
}
