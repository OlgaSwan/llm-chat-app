import { OpenRouter } from '@openrouter/sdk';

export async function generateThreadName(firstMessage: string, apiKey: string): Promise<string> {
    try {
        const openRouter = new OpenRouter({
            apiKey,
        });

        const completion = await openRouter.chat.send({
            // completion.choices?.[0]?.message?.content is empty 'openai/gpt-5-mini'
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'Generate a concise, 3-5 word title for a conversation that starts with the following user message. Only respond with the title, nothing else.',
                },
                {
                    role: 'user',
                    content: firstMessage,
                },
            ],
            maxTokens: 20,
        });

        const content = completion.choices?.[0]?.message?.content;

        if (typeof content === 'string') {
            const generatedName = content.trim();
            if (generatedName) {
                return generatedName.replace(/^["']|["']$/g, '');
            }
        }

        return 'New Thread';
    } catch (error) {
        console.error('Error generating thread name:', error);
        return 'New Thread';
    }
}
