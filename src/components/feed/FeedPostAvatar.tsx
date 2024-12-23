import { User } from 'lucide-react'
import type { FeedData } from './MainFeed'
import { useState } from 'react'

export const getProfilePic = (author: string) =>
  `/images/profile_${author.replace('@', '')}.jpg`

/**
 * Attempts to display the profile image of the post author, which can be found
 * in the public/images/profile_<username>.jpg folder.
 *
 * @param author - the author of the post (can include the @ symbol)
 */
export default function FeedPostAvatar(props: Pick<FeedData, 'author'>) {
  const [profileImagePath] = useState(getProfilePic(props.author))
  const [isError, setIsError] = useState(false)

  return (
    <div className="bg-gray-200 overflow-clip rounded-full w-10 h-10 flex items-center justify-center">
      {isError ? (
        <User className="text-gray-500" size={20} />
      ) : (
        <img
          src={profileImagePath}
          alt={`${props.author}'s profile`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn('[FeedPostAvatar] failed loading image:', e)
            setIsError(true)
          }}
        />
      )}
    </div>
  )
}
