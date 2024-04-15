import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar here */}
      <div className="flex flex-row justify-between px-2 py-1 border-b-2 w-full">
        {/* Logo */}
        <div className="flex flex-row items-center gap-2">
          <img src="https://placehold.co/30x30" alt="logo" />
          <p>Air chat</p>
        </div>
        {/* buttons and options */}
        <div className="flex flex-row gap-2">
          <Link href={'/auth/signup'}>Signup</Link>
          <Link href={'/auth/login'}>Login</Link>
        </div>
      </div>

      {/* Main body */}
      <div className="flex flex-col justify-center items-center w-full h-full">
        <h1>MVP here</h1>
        <p>
          <Link href={'/auth/signup'} className="font-semibold text-blue-600">
            Signup
          </Link>{' '}
          or{' '}
          <Link href={'/auth/login'} className="font-semibold text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
