import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ybkmfqypxhmdbidjxtgo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlia21mcXlweGhtZGJpZGp4dGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTE3MjMsImV4cCI6MjA4MTcyNzcyM30.rn_p44azv6bHgjzN9ZpV9TxuvMSR0nb5K2dD9F5krbM';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
