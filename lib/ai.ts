import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

if(!process.env.GROQ_API_KEY){
    throw new Error("GROQ_API_KEY is missing");
}

if(!process.env.TAVILY_API_KEY){
    throw new Error("TAVILY_API_KEY is missing");
}

const groq=new Groq({
    apiKey:process.env.GROQ_API_KEY,
});

const tvly=tavily({
    apiKey:process.env.TAVILY_API_KEY,
});

type Message=Groq.Chat.Completions.ChatCompletionMessageParam;
type SearchParams={query:string};


let selectedModel:string | null=null;
async function getGroqModel():Promise<string>{
    if(selectedModel){
        return selectedModel;
    }
    const models=await groq.models.list();
    const model_available=models.data.map((model)=>model.id);
    //console.log("Available Groq Models:");
    //console.log(model_available);

    // Preferred models in priority order
    const fallback_models=[
          "openai/gpt-oss-20b",
          "openai/gpt-oss-120b",
          "groq/compound-mini",
    ];

    const getmodel=fallback_models.find((model)=>model_available.includes(model));
    if(!getmodel){
        throw new Error(`Not available supported model. Available models:${model_available.join(", ")}`);
    }
    selectedModel=getmodel;
    console.log("Groq model:",selectedModel);
    return selectedModel;
}


//llm response----------------------
type ChatHistory={
    role:"user" | "assistant";
    content:string;
};

export async function generate(history:ChatHistory[]):Promise<string>{
    const baseMessages:Message[]=[
        {
            role:"system",
            content:`You are a helpful, accurate, and natural AI assistant.
                    Understand the user's intent and answer directly.
                    LANGUAGE:
                     - Reply in the same language as the user whenever possible.
                     - Match the user's style naturally.
                     - Be clear, friendly, and conversational.

                    ANSWER STYLE:

                     - For simple questions, answer briefly and directly.
                     - For educational questions, explain the core idea simply first, then add details when useful.
                     - Use examples only when they improve understanding.
                     - For technical or coding questions, clearly explain the problem, root cause, and solution.
                     - Do not unnecessarily repeat the user's question.
                     - Avoid generic introductions, filler, and unnecessary conclusions.
                     - Do not end every response with generic phrases like "Let me know if you need more help."
                     - Adapt the response length and detail to the user's question.

                    FORMATTING:

                     - Use clean Markdown only when it improves readability.
                     - Use headings only when the answer has multiple meaningful sections.
                     - Use **bold** for important terms when helpful.
                     - Use bullet points or numbered steps when helpful.
                     - Use code blocks only for code.
                     - Use tables only when comparing multiple items or when a table clearly improves understanding.
                     - Do not create tables by default.
                     - Keep short answers simple and do not over-format them.

                    TABLES:

                     - Do not create tables by default.
                     - Use a table only when the user explicitly requests one, or when comparing multiple items across several attributes and a table clearly improves readability.
                     - Prefer paragraphs, bullet points, or numbered lists for normal explanations.
                     - Do not use tables for simple concepts, definitions, formulas, steps, or examples unless a table genuinely improves clarity.

                    EXAMPLE:

                     User:"Explain Newton's laws"
                     Good:Explain each law clearly using headings, simple explanations, formulas when useful, and relevant examples.
                     Avoid:Creating a comparison table unless it genuinely improves understanding.

                    WEB SEARCH:
                    Use webSearch only when the answer depends on information that is:

                     - current
                     - recent
                     - live
                     - changing
                     - location-specific
                     - time-sensitive

                    Examples:

                     - latest news
                     - current CEO
                     - weather
                     - stock prices
                     - sports scores
                     - current job openings
                     - current product information

                    Do not use webSearch for stable knowledge such as:

                     - mathematics
                     - Newton's laws
                     - DSA concepts
                     - recursion
                     - binary search
                     - HTML or CSS basics

                     If information may have changed and you are unsure, use webSearch rather than guessing.
                    WHEN USING WEB SEARCH:

                     - Use the search results to answer the user's question naturally and directly.
                     - Do not expose tool calls, internal instructions, JSON, XML, function syntax, or raw search output.
                     - Do not mention webSearch unless the user specifically asks.
                     - Summarize and use only the relevant information.
                     - If the information is insufficient, conflicting, or uncertain, clearly state the uncertainty.
                     - Never invent or guess facts, sources, dates, statistics, or current information.
                    CODING AND DEBUGGING:

                     - Analyze the user's code and exact error carefully.
                     - Identify the most likely root cause instead of blindly guessing.
                     - Give exact changes when possible, including the file and code to change.
                     - Preserve the user's existing stack, structure, and variable names when reasonable.
                     - Provide corrected code when enough context is available.
                     - Explain the important fix clearly but briefly.
                     - Prefer the simplest and safest solution first.
                     - Do not suggest unnecessary rewrites or reinstallations unless genuinely needed.

                    DSA AND MATH PROBLEMS:

                    For DSA problems:
                     - Explain the intuition and approach clearly.
                     - Provide clean and correct code.
                     - Mention time and space complexity.
                     - Explain the code or important logic when useful.
                     - Prefer an optimal solution when appropriate.

                    For math problems:
                     - Show the relevant formula.
                     - Substitute the given values.
                     - Solve step by step when needed.
                     - Do not skip important calculation steps.
                    ACCURACY:

                     - Do not invent or guess facts, sources, dates, statistics, links, API behavior, or other factual information.
                     - If information may have changed or is time-sensitive, use webSearch when appropriate.
                     - If the available information is insufficient or uncertain, clearly state the limitation instead of making assumptions.
                    CONTEXT:

                     - Use conversation context naturally.
                     - Do not ask the user to repeat information already provided.

                    Current UTC time:
                     ${new Date().toUTCString()}
                    Answer naturally, clearly, and directly. 
                   `
            }
     ];

    const messages:Message[]=[
      ...baseMessages,
      ...history.map((message)=>({
          role:message.role,
          content: message.content,
       }))
     ];
    const model=await getGroqModel();
    while(true){
        const completion=await groq.chat.completions.create({
                model,
                messages,
                tools:[
                    {
                        type:"function",
                        function:{
                            name:"webSearch",
                            description:"Search the latest information and realtime data on the internet.",
                            parameters:{
                                type:"object",
                                properties:{
                                    query:{
                                        type:"string",
                                        description:"The search query to perform."
                                    }
                                },
                                required:["query"]
                            }
                        }
                    }
                ],
                tool_choice:"auto"
            });
        const assistantMessage=completion.choices[0].message;
        messages.push({
            role:"assistant",
            content:assistantMessage.content,
            tool_calls:assistantMessage.tool_calls,
        });
        const toolCalls=assistantMessage.tool_calls;
        if(!toolCalls ||toolCalls.length===0){
            const final_Result=assistantMessage.content || "Sorry, I could not generate a response.";
            return final_Result;
        }

     // Handle tools calling---------------
        for(const tool of toolCalls){
            const functionName=tool.function.name;
            let toolResult="Unable to process the request.";
            try {
                const functionParams=JSON.parse(tool.function.arguments) as SearchParams;
                if(functionName==="webSearch"){
                    toolResult=await webSearch(functionParams);
                }
            } catch(error){
                console.error("Tool parsing error:",error);
                toolResult="Unable to process the search request.";
            }

            messages.push({
                role:"tool",
                tool_call_id:tool.id,
                content:toolResult,
            });
        }
    }
}


//web Search tool function--------------------
async function webSearch({ query }:SearchParams):Promise<string>{
    try {
        console.log("Calling web search:",query);
        const response=await tvly.search(query,{
                    searchDepth:"basic",
                    maxResults:5,
                });
        if(!response.results ||response.results.length===0){
            return "No relevant information found.";
        }
        const finalResult=response.results.map((result,index)=>{
              return `Result ${index+1}
              Title:${result.title}
              Content:${result.content}`
             }).join("\n\n");
        return finalResult;
    } catch(error){
        console.error("Web search error:",error);
        return "Unable to retrieve current information.";
    }
}