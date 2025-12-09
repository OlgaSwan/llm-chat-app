export async function generateThreadName(firstMessage: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
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
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate name');
    }

    const data = await response.json();
    const generatedName = data.choices?.[0]?.message?.content?.trim();

    if (generatedName) {
      return generatedName.replace(/^["']|["']$/g, '');
    }

    return 'New Thread';
  } catch (error) {
    console.error('Error generating thread name:', error);
    return 'New Thread';
  }
}
