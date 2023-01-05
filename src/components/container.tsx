import BackgroundImage from '../images/background.png'
import Image from 'next/image'

interface ContainerProps {
  children: React.ReactNode
}

export default function Container({ children }: ContainerProps) {

  return (
    <div className="flex flex-grow flex-col overflow-none">
      <div className="absolute -z-10">
        <Image src={BackgroundImage} alt={'Where the dev things are...'} style={{
          objectFit: 'cover'
        }} />
      </div>
      <div className="bg-black mt-96">
        {children}
      </div>
    </div>
  )
}