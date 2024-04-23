'use client'
import { useUserStore } from '@/states/user-state'
import { useRouter } from 'next/navigation'

interface Props {
  children: React.ReactNode
}

export const Protected = ({ children }: Props) => {
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  const router = useRouter()

  const getUserData = async () => {
    const token = localStorage.getItem('token')
    try {
      if (!token || token.length == 0) throw new Error('No token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/user/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok) setUser(data.data)
      else throw Error(data?.message || 'Error')
    } catch (error) {
      console.log(error)
      localStorage.removeItem('token')
      setUser(null)
      router.push('/auth/login')
    }
  }

  if (!user || user == null) {
    getUserData()
  } else {
    return <>{children}</>
  }
}
