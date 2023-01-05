import WebsiteLogo from '../images/asleepace-light.png'
import Image from 'next/image'
import { Varela_Round } from '@next/font/google'

const varela = Varela_Round({ subsets: ['latin'], weight: '400' })

export default function Navigation() {

  const navigationStyles = [
    varela.className,
    'text-white',
    'absolute',
    'right-0',
    'left-0',
    'top-0',
    'flex',
    'flex-row',
    'justify-between',
    'items-center',
    'bg-black',
    'p-2'
  ]

  return (
    <div className={navigationStyles.join(' ')}>
      <div className="flex flex-row items-center p-1">
        <Image src={WebsiteLogo} alt="Asleepace.com" className='w-[50px] mr-2' />
        <button className='font-bold'><h1 className="text-white text-xl">Asleepace</h1></button>
      </div>
      <div className='flex-row space-between pr-8'>
        <button className='px-4'>Blog</button>
        <button className='px-4'>Docs</button>
        <button className='px-4'>Tools</button>
        <button className='px-4'>About</button>
      </div>
    </div>
  )
}