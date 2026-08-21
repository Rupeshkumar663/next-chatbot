"use client";

import { useRef, useState } from "react";
import { IoSend } from "react-icons/io5";

type UserInputProps={generate:(text:string)=>void;
    loading:boolean;
};

function UserInput({generate,loading}:UserInputProps){
    const [input,setInput]=useState("");
    const textareaRef =useRef<HTMLTextAreaElement>(null);
    const handleResize=(e:React.FormEvent<HTMLTextAreaElement>)=>{
        const target=e.currentTarget;
        target.style.height="0px";
        const height=Math.min(target.scrollHeight, 120);
        target.style.height=`${height}px`;
        target.style.overflowY=target.scrollHeight>120?"auto":"hidden";
    };
    const handleSend=()=>{
        const text=input.trim();
        if(!text || loading){
            return;
        }
        generate(text);
        setInput("");
        if(textareaRef.current){
            textareaRef.current.style.height="24px";
            textareaRef.current.style.overflowY="hidden";
        }
    };
    const handleEnter=(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
        if(e.key==="Enter" &&!e.shiftKey){
            e.preventDefault();
            handleSend();
        }
    };
    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#212121] pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="max-w-3xl mx-auto px-4">
                <div className="rounded-3xl  border border-neutral-700 bg-[#303030] px-4 py-3">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        placeholder="Ask anything"
                        onChange={(e)=>setInput(e.target.value)}
                        onInput={handleResize}
                        onKeyDown={handleEnter}
                       className="w-full resize-none bg-transparent outline-none text-white placeholder:text-gray-400 text-base"
                        style={{minHeight:"24px",maxHeight:"120px"}}
                    />
                    <div className="flex justify-end mt-3">
                        <button type="button" onClick={handleSend} disabled={ loading ||!input.trim()}
                            className=" w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"><IoSend size={18}/>
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">AI can make mistakes.Verify important information.</p>
            </div>
        </div>
    );
}
export default UserInput;