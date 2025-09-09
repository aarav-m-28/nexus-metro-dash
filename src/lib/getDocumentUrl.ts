import { supabase } from "@/integrations/supabase/client";

export async function getDocumentUrl(storagePath: string) {
  // For public buckets, use getPublicUrl. For private, use createSignedUrl.
  const { data } = supabase.storage.from("documents").getPublicUrl(storagePath);
  return data.publicUrl;
  // For private buckets, use:
  // const { data } = await supabase.storage.from("documents").createSignedUrl(storagePath, 60);
  // return data.signedUrl;
}
