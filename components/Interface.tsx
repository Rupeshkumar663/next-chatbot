"use client";

import{useEffect,useRef,useState} from "react";
import Message from "./Message";
import ChatInput from "./UserInput";

type ChatMessage={
    role: "user" | "assistant";
    content:string;
};

function Interface(){
    const [messages,setMessages]=useState<ChatMessage[]>([]);
    const [loading,setLoading]=useState(false);
    const [threadId,setThreadId]=useState<string | null>(null);
    const chatRef=useRef<HTMLDivElement>(null);
    useEffect(()=>{
        if(chatRef.current){
            chatRef.current.scrollTop=chatRef.current.scrollHeight;
        }
    },[messages,loading]);

    const generate=async(text:string)=>{
        const updatedMessages:ChatMessage[]=[...messages,
            {
                role:"user",
                content:text
            }
        ];
        setMessages(updatedMessages);
        setLoading(true);
        try{
            const response=await fetch("/llm/chat",{method:"POST",
                headers:{
                          "Content-Type":"application/json"
                        },
                        body:JSON.stringify({
                            message:text,
                            threadId:threadId
                        })
                    }
                );
            const result:{message?:string,threadId?:string,error?:string}=await response.json();
            if(!response.ok){
                throw new Error(result.error ||"Server Error");
            }
            if(result.threadId){
                setThreadId(result.threadId);
            }
            setMessages([...updatedMessages,
                {
                    role:"assistant",
                    content: result.message ||"Sorry, I could not generate a response."
                }
            ]);

        } catch(err:unknown){
            console.error(err);
            const errorMessage=err instanceof Error?err.message:"Something went wrong.";
            setMessages([...updatedMessages,
                {
                    role:"assistant",
                    content:errorMessage
                }
            ]);
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className=" h-screen bg-[#212121] text-white flex flex-col">
            <div ref={chatRef} className="flex-1 overflow-y-auto pb-40">
                <div className="max-w-3xl mx-auto px-4 py-6 ">
                    {messages.length===0?(
                        <div className="flex h-[70vh] items-center justify-center">
                            <h1 className="text-3xl md:text-4xl font-semibold text-gray-400 text-center">What can I help with?</h1>
                        </div>
                    ):(
                        <>
                            {messages.map((msg,index)=>(<Message key={index} role={msg.role} content={ msg.content}/>))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#303030] rounded-2xl px-4 py-3 animate-pulse ">Thinking...</div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
          <ChatInput generate={generate} loading={loading}/>
        </div>
    );
}

export default Interface;