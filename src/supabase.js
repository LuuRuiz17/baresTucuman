import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://iovikakbdkwotsyswtcl.supabase.co/",
  "sb_publishable_LnUkrqv8HB7m0XL9JUhVmw_m9tLe4qV"
);

export default supabase;