"use client";

import { Heading } from '@/components/heading';
import { MessageSquare } from 'lucide-react';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from './constants';
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { ChatCompletionMessage } from 'openai/resources/index.mjs';
import React, { useState } from 'react';
import { Empty } from '@/components/empty';
import { Loader } from '@/components/loader';
import { cn } from '@/lib/utils';
import { BotAvatar } from '@/components/bot-avatar';
import { UserAvatar } from '@/components/user-avatar';

const ConversationPage = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatCompletionMessage[]>([]);
    // const [messages, setMessages] = useState<string[]>([]);
    const apiKey = process.env.OPENAI_API_KEY;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const userMessage = {
                role: "user",
                content: values.prompt,
            };
            const newMessages = [...messages, userMessage];

            // console.log("From Conversation Page", values)

            const response = await axios.post("/api/conversation", {
                messages: newMessages,
            });

            console.log("From Conversation Page", response)


            setMessages((current) => [... current, userMessage, response.data]);

            form.reset();

        } catch (error: any) {
            // TODO: Open Pro Modal
            console.log(["This error is from the client side"],error)
        } finally {
            router.refresh();
        }
    }
    
    return(
        <div>
            <Heading
                title="Conversation"
                description="Our most advanced conversation model"
                icon={MessageSquare}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2'
                        >
                            <FormField 
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="col-span-12 lg:col-span-10">
                                        <FormControl className="m-0 p-0">
                                            <Input 
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="How do I calculate the radius of a circle?"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button className='col-span-12 lg:col-span-2 w-full' disabled={isLoading}>
                                Generate
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className='space-y-4 mt-4'>
                    {isLoading && (
                        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                            <Loader />
                        </div>
                    )

                    }
                    {messages.length === 0 && !isLoading &&(
                        <div>
                            <Empty label="No conversation started." />
                        </div>
                    )}
                    <div className="flex flex-col-reverse gap-y-4">
                        {messages.map((message) => (
                            <div 
                                key={message.content}
                                className={cn("p-8 w-full items-start gap-x-8 rounded-lg", message.role === "assistant" ? "bg-white border border-black/10" : "bg-muted ")}
                                >
                                    {message.role === "assistant" ? <UserAvatar /> : <BotAvatar /> }
                                    <p className='text-sm'>
                                        {message.content}
                                    </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}
export default ConversationPage;