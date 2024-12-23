import { Tag } from 'lucide-react'
import type { FeedData } from './MainFeed'
import FeedPostAvatar from './FeedPostAvatar'

export default function FeedPost(props: FeedData) {
  return (
    <div className="bg-white border w-full rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-start justify-center space-x-3">
        {/* User Avatar Placeholder */}
        <FeedPostAvatar author={props.author} />

        <div className="flex-1 min-h-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base">{props.author}</span>
              <span className="text-gray-500 font-medium text-sm tracking-wide">
                •{' '}
                {props.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Category Tag */}
            <div className="flex items-center text-xs text-gray-600">
              <Tag className="mr-1" size={12} />
              {props.category}
            </div>
          </div>

          {/* Post Content */}
          <p className="mt-1 text-base font-medium">{props.content}</p>
        </div>
      </div>
    </div>
  )
}
