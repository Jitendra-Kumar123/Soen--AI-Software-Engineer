import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateResult(prompt) {
  try {

    const isCodePrompt = /create|function|code|js|javascript|file|component|class|module/i.test(prompt);

    let response_format;
    let systemContent;

    if (isCodePrompt) {
      
      response_format = { type: "json_object" };
      systemContent = `You are an expert in MERN and Development. You have an experience of 10 years in the development.
You always write code in modular and break the code in possible way and follow best practices,
You use understandable comments in the code, you create file as needed, you write code while maintaining
the working of previous code. You always follow the best practices of the development You never miss the edge
cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
You always write unit tests and integration tests for your code. You write test cases for all the functionalities of your code.

Examples:

<example>

user: Create an express application,
response: {
"text": "Here is the fileTree structure for an express server",
"fileTree": {
"app.js": {
"content": "const express = require('express');\\n\\nconst app = express();\\n\\napp.get('/', (req, res) => {\\n    res.send('hey');\\n});\\n\\napp.listen(3000, () => {\\n    console.log('Server is running on port 3000');\\n});"
},
"package.json": {
"content": "{\\n    \\"name\\": \\"temp-server\\",\\n    \\"version\\": \\"1.0.0\\",\\n    \\"description\\": \\"\\",\\n    \\"main\\": \\"index.js\\",\\n    \\"scripts\\": {\\n        \\"test\\": \\"echo \\\\\\"Error: no test specified\\\\\\" && exit 1\\"\\n    },\\n    \\"keywords\\": [],\\n    \\"author\\": \\"\\",\\n    \\"license\\": \\"ISC\\",\\n    \\"type\\": \\"commonjs\\"\\n}"
}
}
}
</example>

<example>
user: create a js function sum,
response: {
"text": "Here is a simple sum function in JavaScript",
"fileTree": {
"sum.js": {
"content": "function sum(a, b) {\\n  return a + b;\\n}"
}
}
}
</example>

IMPORTANT: don't use file name like routes/index.js
For code generation requests, always use the fileTree structure as shown in the examples. Do not create custom keys like 'function' or 'code'. Always respond in valid JSON format.`;
    } else {
      
      response_format = { type: "text" };
      systemContent = `You are a helpful AI assistant. Respond naturally and conversationally to user queries. Provide informative, accurate, and engaging responses.`;
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        {
          role: "system",
          content: systemContent
        },
        { role: "user", content: prompt }
      ],
      response_format: isCodePrompt ? { type: "json_object" } : undefined,
    });

    const content = response.choices[0].message.content;
    if (!content) return "No response";

    if (isCodePrompt) {
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        return { text: content };
      }
    } else {
      return content; 
    }
  } catch (error) {
    console.error("Groq AI error:", error);
    throw new Error("Groq API request failed");
  }
}
