import React from 'react'
import { User, Clock, Tag } from 'lucide-react'
import type { FeedData } from './MainFeed'

export default function FeedPost(props: FeedData) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-start space-x-3">
        {/* User Avatar Placeholder */}
        <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
          <User className="text-gray-500" size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{props.author}</span>
              <span className="text-gray-500 text-sm">
                •{' '}
                {props.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Category Tag */}
            <div className="flex items-center text-xs text-gray-600">
              <Tag className="mr-1" size={12} />
              {props.category}
            </div>
          </div>

          {/* Post Title */}
          <h3 className="mt-2 text-base font-medium">{props.title}</h3>

          {/* Optional Content */}
          {props.content && (
            <p className="text-gray-700 mt-2 text-sm">{props.content}</p>
          )}

          {/* Interaction Area */}
          <div className="flex items-center justify-between mt-3 text-gray-500">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 hover:text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{props.likes || 0}</span>
              </button>

              <button className="flex items-center space-x-1 hover:text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{props.comments || 0}</span>
              </button>
            </div>

            {/* Share Button */}
            <button className="text-gray-500 hover:text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
