"use server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create a companion");

  return data[0];
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const supabase = createSupabaseClient();

  let query = supabase.from("companions").select();

  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) throw new Error(error.message);

  return companions;
};

export const getCompanion = async (id: string) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error) return;
  console.log(error);

  return data[0];
};

export const addtoSessionHistory = async (companionId: string) => {
  const { userId } = await auth();
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) throw new Error(error.message);

  return data;
};

export const getRecentSessions = async (limit = 10) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companions: companion_id (*)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

export const getUserSessions = async (userId: string, limit = 10) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companions: companion_id (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

export const getUserCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId);

  if (error) throw new Error(error.message);

  return data;
};

export const newCompanionPermissions = async () => {
  const {userId, has} = await auth();
  const supabase = createSupabaseClient()

  let limit = 0;
  
  if(has({plan: 'pro'})) {
    return true;
  } else if(has({feature: "3_companion_limit"})){
    limit= 3;
  } else if(has({feature: "10_companion_limit"})){
    limit= 10;
  }

  const {data, error} = await supabase.from('companions')
  .select('id', {count: "exact"})
  .eq('author', userId)

  if(error) throw new Error(error.message);

  const companionCount = data?.length

  if(companionCount > limit){
    return false
  } else {
    return true
  }
}

// Bookmarks - FIXED VERSION
export const addBookmark = async (companionId: string, path: string) => {
  console.log("🚀 Adding bookmark for:", companionId);
  
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const supabase = createSupabaseClient();
  
  try {
    // FIXED: Use maybeSingle() instead of single() to avoid errors when no row exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("companion_id", companionId)
      .eq("user_id", userId)
      .maybeSingle(); // This prevents the error when no bookmark exists
    
    if (checkError) {
      console.error("Error checking existing bookmark:", checkError);
      throw new Error(`Failed to check existing bookmark: ${checkError.message}`);
    }
    
    if (existingBookmark) {
      console.log("Bookmark already exists");
      throw new Error("Companion is already bookmarked");
    }
    
    console.log("Creating new bookmark...");
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        companion_id: companionId,
        user_id: userId,
      })
      .select(); // Add select to return inserted data
    
    if (error) {
      console.error("Error creating bookmark:", error);
      throw new Error(error.message);
    }
    
    console.log("✅ Bookmark created successfully:", data);
    
    // Revalidate the path to force a re-render of the page
    revalidatePath(path);
    return data;
  } catch (error) {
    console.error("💥 addBookmark failed:", error);
    throw error;
  }
};

export const removeBookmark = async (companionId: string, path: string) => {
  console.log("🗑️ Removing bookmark for:", companionId);
  
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("companion_id", companionId)
      .eq("user_id", userId)
      .select(); // Add select to see what was deleted
      
    if (error) {
      console.error("Error removing bookmark:", error);
      throw new Error(error.message);
    }
    
    console.log("✅ Bookmark removed successfully:", data);
    
    revalidatePath(path);
    return data;
  } catch (error) {
    console.error("💥 removeBookmark failed:", error);
    throw error;
  }
};

// Check if a companion is bookmarked by the user
export const isBookmarked = async (companionId: string, userId: string) => {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("companion_id", companionId)
    .eq("user_id", userId)
    .maybeSingle(); // FIXED: Use maybeSingle instead of single
    
  if (error) {
    console.error("Error checking if bookmarked:", error);
    throw new Error(error.message);
  }
  
  return !!data;
};

// Get bookmarked companions for a user
export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`)
    .eq("user_id", userId);
    
  if (error) {
    throw new Error(error.message);
  }
  
  // Filter out any null companions (in case of orphaned bookmarks)
  return data?.map(({ companions }) => companions).filter(Boolean) || [];
};