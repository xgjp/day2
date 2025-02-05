import { createClient } from "@/lib/supabase/client";

export const uploadDriveFile = async (file: File) => {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.error("User not authenticated");
    return null; // ❌ Return `null` instead of an empty object
  }

  const user = userData.user;
  const filePath = `${user.id}/drive/${Date.now()}_${file.name}`;

  const { data: storageData, error: storageError } = await supabase.storage
    .from("drive")
    .upload(filePath, file);

  if (storageError) {
    console.error("Error uploading file:", storageError);
    return null; // ❌ Return `null` instead of `{}`.
  }

  const publicUrlData = supabase.storage.from("drive").getPublicUrl(storageData.path);
  const publicUrl = publicUrlData.data.publicUrl;

  if (!publicUrl) {
    console.error("Error retrieving file URL.");
    return null;
  }

  const { error: dbError } = await supabase.from("drive_files").insert({
    name: file.name,
    storage_path: storageData.path,
    user_id: user.id,
  });

  if (dbError) {
    console.error("Error inserting file record:", dbError);
    return null;
  }

  return { publicUrl, filePath }; // ✅ Ensure a valid response is returned.
};
