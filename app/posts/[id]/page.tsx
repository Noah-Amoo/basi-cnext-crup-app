'use client'

import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

interface ReadAndEditProps {
  params: {
    id: string
  }
}

interface Post {
  id: string,
  title: string,
  content: string
}

export default function ReadAndEdit({params} : ReadAndEditProps) {
    const id = params?.id
    const searchQuery = useSearchParams()
    const mode = searchQuery.get('mode')

    const [post, setPost] = useState<Post | null>(null)
    const [editing, setEditing] = useState(mode === 'edit')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const router = useRouter()

    // Memoize fetchPost to avoid recreating it on each render
  const fetchPost = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/posts/${id}`);
      setPost(response.data);
      setTitle(response.data.title)
      setContent(response.data.content)
    } 
    catch (error) {
      console.error("Error fetching post:", error);
    }
  }, [id]); // Only re-create fetchPost if 'id' changes

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id, fetchPost]); // Include fetchPost in the dependency array

  useEffect(() => {
    setEditing(mode === 'edit')
  }, [mode])

  const handleSubmit = async (e: { preventDefault: () => void }) => {
      e.preventDefault()
      await axios.put(`http://localhost:5000/posts/${id}`, {title, content})
      setEditing(false)
      fetchPost()
  }

  const handleDelete = async (id: string) => {
      await axios.delete(`http://localhost:5000/posts/${id}`)
      setPost(null)
      router.push('/')
  }

  return (
    <div className='py-20'>
        <h1 className='text-3xl text-center'>{editing ? 'Edit Post' : 'Read Post'}</h1>
        {post && (
          <div className='flex flex-col items-center'>
              {editing ? (
                <form onSubmit={handleSubmit} className='flex flex-col space-y-4 mt-6 border p-6'>
                  <input 
                    type="text" 
                    placeholder='Title' 
                    value={title} 
                    className='p-2 border border-slate-500' 
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea 
                    value={content} 
                    className='borderr border-slate-500'
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <button className='w-full bg-green-300'>Save</button>
                </form>
              ) : (
                <div className='mt-5'>
                  <h1 className='text-2xl font-bold'>{post.title}</h1>
                  <p>{post.content}</p>
              </div>
              )}
            <div className='flex space-x-4 mt-5'>
              <button onClick={() => router.push('/')} className='w-full bg-green-400 px-3 py-1.5'>Home</button>
              <button onClick={() => setEditing(!editing)} className='w-full bg-blue-300 px-3 py-1.5'>Edit</button>
              <button onClick={() => handleDelete(post.id)} className='w-full bg-red-300 px-3 py-1.5'>Delete</button>
            </div>
          </div>
        )}
    </div>
  )
}
