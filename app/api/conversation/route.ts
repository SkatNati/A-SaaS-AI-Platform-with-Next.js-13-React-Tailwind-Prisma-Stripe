// import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
// import { Configuration, OpenAIApi } from "openai"
import Replicate from "replicate"
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// const replicate = new Replicate();
export async function POST(
  req: Request
){
  try {
    // const { userId } = auth()
    const body = await req.json()
    const { messages } = body

    // if (!userId){
    //   return new NextResponse("Unauthorized", { status: 401 })
    // }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 })
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 })
    }
     const stream = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say this is a test" }],
          stream: true,
      });
      for await (const chunk of stream) {
      


    return NextResponse.json(process.stdout.write(chunk.choices[0]?.delta?.content || ""))
  } 
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}