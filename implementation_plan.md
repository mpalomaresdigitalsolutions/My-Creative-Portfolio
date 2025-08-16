# Implementation Plan

[Overview]
This plan addresses two critical errors in the chatbot application: a failing Netlify serverless function for the DeepSeek API and a Supabase database error caused by a missing table. The goal is to fix these issues to restore the chatbot's functionality.

[Types]
No type system changes are required.

[Files]
This plan involves modifying two files: `netlify/functions/deepseek.js` and `chatbot.js`.

- `netlify/functions/deepseek.js`: The export method will be changed from ES modules (`export default`) to CommonJS (`exports.handler`) to ensure compatibility with the Netlify functions environment.
- `chatbot.js`: The error handling for the DeepSeek API call will be improved to handle non-JSON responses, preventing crashes when the server returns HTML error pages.

[Functions]
The following functions will be modified:

- `deepseek` (in `netlify/functions/deepseek.js`): The function signature will be changed to `exports.handler = async function(event, context)` to use the CommonJS module format.
- `getBotResponse` (in `chatbot.js`): The `catch` block will be updated to check the `Content-Type` of the error response. If it's not JSON, it will handle the error gracefully without trying to parse it as JSON.

[Classes]
No class modifications are required.

[Dependencies]
No dependency modifications are required.

[Testing]
After applying the fixes, the chatbot should be tested to ensure that it can successfully communicate with the DeepSeek API and save messages to the Supabase database.

[Implementation Order]
1.  Modify `netlify/functions/deepseek.js` to use `exports.handler`.
2.  Modify `chatbot.js` to improve error handling.
3.  Provide the user with the SQL command to create the `messages` table in Supabase.
