import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pnvnzjwcbnkiukumrdbj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudm56andjYm5raXVrdW1yZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDM1NDQsImV4cCI6MjA2ODQ3OTU0NH0.2brQjJTBXEdL-SZCDVRaEsnl6BkcH8EpbzDFq7JI2YQ";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase