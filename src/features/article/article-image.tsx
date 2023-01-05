import Image, { StaticImageData } from 'next/image'
import defaultImage from '@images/background.png'

interface ArticleImageProps {
  image?: StaticImageData
}

export default function ArticleImage({ image }: ArticleImageProps) {
  return (
    <Image src={image ?? defaultImage} alt='Blog image' className='rounded-3xl overflow-none' style={{
      objectFit: 'cover',
      height: '340px',
      width: '100%',
    }} />
  )
}