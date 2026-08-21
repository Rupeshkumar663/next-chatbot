import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request:Request,{params}:{params:Promise<{ threadId:string}>}){
    try{
        const { threadId }=await params;
        const messages=await prisma.message.findMany({
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
        return NextResponse.json({messages});
    } catch(error){
        console.error("Load chat error:",error);
        return NextResponse.json({error:"Unable to load chat history."},{status: 500});
    }
}