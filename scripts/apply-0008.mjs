// Compatibility entrypoint: migrations are restricted to the isolated local stack.
import { bootstrapLocalDatabase } from "./local-supabase.mjs";
await bootstrapLocalDatabase();
