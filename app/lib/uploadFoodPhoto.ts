import { createClient } from '@/lib/supabase/client';

export const uploadFoodPhoto = async (file: File) => {
    const supabase = createClient();
  // Step 1: Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error('User not authenticated', userError);
    return;
  }
  const user = userData.user;
  const filePath = `${user.id}/food/${Date.now()}_${file.name}`;

  // Step 2: Upload file to 'food' bucket
  const { data: storageData, error: storageError } = await supabase.storage
    .from('food')
    .upload(filePath, file);
  if (storageError) {
    console.error('Error uploading file:', storageError);
    return;
  }
  if (!storageData || !storageData.path) {
    console.error('No storage data returned from file upload');
    return;
  }

  // Optional: Get public URL for later display
  const { data: { publicUrl } } = supabase.storage.from('food').getPublicUrl(storageData.path);

  // Step 3: Insert record into food_photos table with returning option
  const { data: insertData, error: dbError } = await supabase
    .from('food_photos')
    .insert({
      name: file.name,
      storage_path: storageData.path,
      user_id: user.id,
    });

  if (dbError) {
    console.error('Error inserting photo record:', JSON.stringify(dbError, null, 2));
    return;
  }
  console.log('Inserted record:', insertData);
  return publicUrl;
};
