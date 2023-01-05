
export default function Navigation() {
  return (
    <div className='absolute left-0 right-0 top-0 flex flex-row justify-between p-8'>
      <button className='font-bold'>Asleepace</button>
      <div className='flex-row space-between'>
        <button className='px-4'>Blog</button>
        <button className='px-4'>Docs</button>
        <button className='px-4'>Tools</button>
        <button className='px-4'>About</button>
      </div>
    </div>
  )
}