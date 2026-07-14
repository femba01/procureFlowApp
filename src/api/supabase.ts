
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://cdykbjgtphamexcxrsze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkeWtiamd0cGhhbWV4Y3hyc3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDAyNzIsImV4cCI6MjA5OTM3NjI3Mn0.85D-8ZiHP1vk0wMAMWZvaiVgEwE5YZOq7CR9fKNUZlc';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;