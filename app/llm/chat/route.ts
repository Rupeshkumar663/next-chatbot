import { NextResponse } from "next/server";
import { generate } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(req:Request){
    try{
        const body=await req.json();
        const message=body.message?.trim();
        let threadId=body.threadId;
        if(!message){
            return NextResponse.json({error:"Message is required"},{status:400});
        }
        
        //Create a new chat if no thread exists--------------------
        if(!threadId){
            const chat=await prisma.chat.create({
                data:{}
            });
            threadId=chat.id;
        }

        //Save user message------------------
        await prisma.message.create({
            data:{
                role:"user",
                content:message,
                chatId:threadId
            }
        });

        //Get complete conversation history-----------------
        const history=await prisma.message.findMany({
            where:{
                chatId:threadId
            },
            orderBy:{
                createdAt:"asc"
            },
            select:{
                role:true,
                content:true
            }
        });

        //Generate AI response using database history-----------------------
        const result=await generate(history.map((item)=>({
                role:item.role as "user" | "assistant",
                content:item.content
            }))
        );

        //Save assistant response------------------------------
        await prisma.message.create({
            data:{
                role:"assistant",
                content:result,
                chatId:threadId
            }
        });
        return NextResponse.json({message:result,threadId});
    } catch(error){
        console.error("Chat API error:",error);
        return NextResponse.json({error:"Something went wrong. Please try again."},{status:500});
    }
}