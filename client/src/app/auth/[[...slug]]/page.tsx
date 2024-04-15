'use client'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import React, { useState } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND

type Props = {
  params: {
    slug: string
  }
}

interface submitData {
  target: {
    name: { value: string }
    email: { value: string }
    password: { value: string }
  }
}

const Auth = ({ params }: Props) => {
  const [errorText, setErrorText] = useState('')
  const router = useRouter()

  const page: string = params?.slug ? params.slug[0] : 'signup'
  if (page !== 'login' && page !== 'signup') {
    return notFound()
  }

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement> & submitData,
  ) => {
    e.preventDefault()
    try {
      const name = e.target.name.value
      const email = e.target.email.value
      const password = e.target.password.value
      if (name.length < 0 || email.length < 0 || password.length < 0) {
        setErrorText('All fields not provided')
        return
      }
      const res = await fetch(`${BACKEND}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (data.ok) {
        console.log('User created successfully')
        const token = data.token
        localStorage.setItem('token', token)
        router.push('/update-details')
      } else {
        setErrorText(data?.message)
      }
    } catch (error) {
      console.log(error)
      setErrorText('Interal server error')
    }
  }

  const handlelogin = async (
    e: React.FormEvent<HTMLFormElement> & submitData,
  ) => {
    try {
      e.preventDefault()
      const email = e.target.email.value
      const password = e.target.password.value
      if (email.length < 0 || password.length < 0) {
        setErrorText('All fields not provided')
        return
      }
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        console.log('User logged successfully')
        const token = data.token
        if (!token) throw new Error('Internal server error')
        localStorage.setItem('token', token)
        router.push('/chat')
      } else {
        setErrorText(data?.message)
      }
    } catch (error) {
      console.log(error)
      setErrorText('Interal server error')
    }
  }

  return (
    <div className="flex flex-row justify-center items-center w-full h-screen">
      <div className="flex border border-red-500 w-full h-full">
        <img
          src="https://picsum.photos/800/1000"
          alt="testing"
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col justify-center items-center border border-blue-500 w-full h-full">
        {page == 'login' ? (
          <form
            onSubmit={handlelogin}
            className="flex flex-col gap-4 px-4 py-2"
          >
            <h1>Login</h1>
            <input
              type="email"
              placeholder="Email"
              name="email"
              className="border-gray-500 p-2 border"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              className="border-gray-500 p-2 border"
            />
            <button type="submit" className="bg-blue-500 p-2 text-white">
              Login
            </button>
            <p>
              Dont have an account?{' '}
              <Link
                href={'/auth/signup'}
                className="font-semibold text-blue-500"
              >
                Signup
              </Link>
            </p>
            {errorText?.length > 0 && (
              <p className="text-red-400">{errorText}</p>
            )}
          </form>
        ) : (
          <form
            onSubmit={handleSignup}
            className="flex flex-col gap-4 px-4 py-2"
          >
            <h1>Signup</h1>
            <input
              type="text"
              placeholder="Name"
              name="name"
              className="border-gray-500 p-2 border"
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              className="border-gray-500 p-2 border"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              className="border-gray-500 p-2 border"
            />
            <button type="submit" className="bg-blue-500 p-2 text-white">
              Signup
            </button>
            <p>
              Have an account?{' '}
              <Link
                href={'/auth/login'}
                className="font-semibold text-blue-500"
              >
                Login
              </Link>
            </p>
            {errorText?.length > 0 && (
              <p className="text-red-400">{errorText}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default Auth
