import { supabase } from './supabase'
export const signUp = async (email: string, password: string) => {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
  
    if (authError) {
      return { error: authError }
    }
  
    // Then create the profile record
    const { error: profileError } = await supabase
      .from('profile')
      .insert([
        { 
          id: authData.user?.id,
          email: email
        }
      ])
  
    if (profileError) {
      // Rollback - delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user?.id || '')
      return { error: profileError }
    }
  
    return { data: authData }
  }

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}