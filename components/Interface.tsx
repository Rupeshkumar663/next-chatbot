"use client";

import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import ChatInput from "./UserInput";
import { error } from "console";

type ChatMessage={
    role:"user" | "assistant";
    content:string;
};

function Interface(){
    const [messages,setMessages]=useState<ChatMessage[]>([]);
    const [loading,setLoading]=useState(false);
    const [threadId,setThreadId]=useState<string | null>(null);
    const chatRef=useRef<HTMLDivElement>(null);
    useEffect(()=>{
        if(chatRef.current) {
            chatRef.current.scrollTo({
                top:chatRef.current.scrollHeight,
                behavior:"smooth",
            });
        }
    },[messages,loading]);

    const generate=async(text:string)=>{
        const trimmedText=text.trim();
        if(!trimmedText || loading) 
            return;
        const userMessage:ChatMessage={
            role:"user",
            content:trimmedText,
        };
        setMessages((prev)=>[...prev,userMessage]);
        setLoading(true);
        try {
            const response=await fetch("/llm/chat",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    message:trimmedText,
                    threadId,
                }),
            });
            const result:{
                message?:string;
                threadId?:string;
                error?:string;
            }=await response.json();
            if(!response.ok){
                throw new Error(result.error || "Something went wrong. Please try again.");
            }

            if(result.threadId){
                setThreadId(result.threadId);
            }
            const assistantMessage:ChatMessage={
                role:"assistant",
                content:result.message || "Sorry, I could not generate a response.",
            };
            setMessages((prev)=>[...prev,assistantMessage]);
        } catch(error:unknown){
            console.error("Chat error:",error);
            const errorMessage=error instanceof Error? error.message:"Something went wrong. Please try again.";
            setMessages((prev)=>[...prev,{
                    role:"assistant",
                    content:errorMessage,
                },
            ]);
        } finally{
            setLoading(false);
        }
    };
    return (
        <div className="flex h-screen flex-col bg-[#212121] text-white">
            <div ref={chatRef}className="flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-32">
                    {messages.length===0?(
                        <div className="flex min-h-[70vh] items-center justify-center">
                            <h1 className="text-center text-3xl font-semibold text-gray-400 md:text-4xl">What can I help with?</h1>
                        </div>
                    ):(
                        <>
                            {messages.map((msg,index)=>(
                                <Message
                                    key={index}
                                    role={msg.role}
                                    content={msg.content}
                                />
                            ))}
                            {loading && (
                                <div className="mb-5 flex justify-start">
                                    <div className="rounded-2xl bg-[#303030] px-4 py-3 text-sm text-gray-300">Thinking...</div>
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