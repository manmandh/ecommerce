"use server"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
    }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function getSession() {
  const supabase = createServerClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const supabase = createServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
