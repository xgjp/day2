import { supabase } from '@/lib/supabase/supabaseClient';

export const uploadDriveFile = async (file: File) => {
   const { data: userData, error: userError } = await supabase.auth.getUser();
   if (userError || !userData.user) {
      console.error('User not authenticated');
      return null;
   }

   const user = userData.user;
   const filePath = `${user.id}/drive/${Date.now()}_${file.name}`;

   const { data: storageData, error: storageError } = await supabase.storage
      .from('drive')
      .upload(filePath, file);

   if (storageError) {
      console.error('Error uploading file:', storageError);
      return null;
   }

   // 🔥 Ensure correct URL retrieval
   const publicUrl = supabase.storage.from('drive').getPublicUrl(filePath).data.publicUrl;

   if (!publicUrl) {
      console.error('Error retrieving public URL.');
      return null;
   }

   // 🔥 Store the file in `drive_files`
   const { error: dbError } = await supabase.from('drive_files').insert({
      name: file.name,
      storage_path: filePath,  // ✅ Correct file path
      user_id: user.id,
   });

   if (dbError) {
      console.error('Error inserting file record:', dbError);
      return null;
   }

   return { publicUrl, filePath }; // ✅ Ensure a valid response
};
