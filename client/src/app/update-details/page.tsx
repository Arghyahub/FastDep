import React from 'react'

type Props = {}

const UpdateDetails = (props: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {}
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
        <input type="text" name="avatar" placeholder="Avatar" />
      </form>
    </div>
  )
}

export default UpdateDetails
