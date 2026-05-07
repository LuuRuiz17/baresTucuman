import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://droescahxqmdzoezagyr.supabase.co",
  "sb_publishable_GPfAr9kDeR3VQNEljAp1iQ_G25pj5C7"
);

export default supabase;