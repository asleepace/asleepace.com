import WebsiteLogo from '../images/logo.png'
import Image from 'next/image'

export default function Navigation() {
  return (
    <div className='navigation absolute left-0 right-0 top-0 flex flex-row justify-between p-2 items-center bg-black/50'>
      <div className="flex flex-row items-center">
        <Image src={WebsiteLogo} alt="Asleepace.com" className='w-[100px]' />
        <button className='font-bold'><h1 className="text-white text-5xl">Asleepace</h1></button>
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