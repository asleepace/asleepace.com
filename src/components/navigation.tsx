import WebsiteLogo from '../images/asleepace-light.png'
import Image from 'next/image'
import { Varela_Round } from '@next/font/google'

const varela = Varela_Round({ subsets: ['latin'], weight: '400' })

export default function Navigation() {

  const navigationStyles = [
    varela.className,
    'navigation',
    'text-white',
    'flex',
    'flex-row',
    'justify-between',
    'items-center',
    'p-2'
  ]

  return (
    <div className={navigationStyles.join(' ')}>
      <div className="flex flex-row space-between py-2 px-4">
        <Image src={WebsiteLogo} alt="Asleepace.com" className='w-[24px] ml-4 mr-4' />
        <button className='font-black'>Asleepace</button>
      </div>
      <div className='flex-row space-between pr-8'>
        <button className='font-thin text-sm px-4'>Home</button>
        <button className='font-thin text-sm px-4'>Tools</button>
        <button className='font-thin text-sm px-4'>About</button>
      </div>
    </div>
  )
}