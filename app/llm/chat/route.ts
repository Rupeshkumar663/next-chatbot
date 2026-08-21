import { NextResponse } from "next/server";
import { generate } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
export async function POST(req:Request){
    try {
        const {message,threadId}:{message:string,threadId?:string}=await req.json();
        if(!message){
            return NextResponse.json({error:"Message is required"},{status:400});
        }
        let currentThreadId=threadId;
        if(!currentThreadId){
            const chat=await prisma.chat.create({
                    data:{
                        title:message.slice(0,50)
                     }
                });
            currentThreadId=chat.id;
        }

        await prisma.message.create({
            data:{
                role:"user",
                content:message,
                chatId:currentThreadId
            }
        });
        const result=await generate(message,currentThreadId);
        await prisma.message.create({
            data:{
                role:"assistant",
                content:result,
                chatId:currentThreadId
            }
        });
        return NextResponse.json({message:result,threadId:currentThreadId});
    } catch(error:unknown){
        console.error(error);
        const errorMessage=error instanceof Error? error.message:"Server Error";
        return NextResponse.json({error:errorMessage},{status:500}
        );
    }
}