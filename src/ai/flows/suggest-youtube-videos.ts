'use server';

/**
 * @fileOverview A YouTube video suggestion AI agent based on task list content.
 *
 * - suggestYoutubeVideos - A function that suggests relevant YouTube videos.
 * - SuggestYoutubeVideosInput - The input type for the suggestYoutubeVideos function.
 * - SuggestYoutubeVideosOutput - The return type for the suggestYoutubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestYoutubeVideosInputSchema = z.object({
  taskList: z.string().describe('A list of tasks the user is currently working on.'),
});
export type SuggestYoutubeVideosInput = z.infer<typeof SuggestYoutubeVideosInputSchema>;

const SuggestYoutubeVideosOutputSchema = z.object({
  videoSuggestions: z
    .array(z.string())
    .describe('An array of suggested YouTube video URLs.'),
});
export type SuggestYoutubeVideosOutput = z.infer<typeof SuggestYoutubeVideosOutputSchema>;

export async function suggestYoutubeVideos(input: SuggestYoutubeVideosInput): Promise<SuggestYoutubeVideosOutput> {
  return suggestYoutubeVideosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestYoutubeVideosPrompt',
  input: {schema: SuggestYoutubeVideosInputSchema},
  output: {schema: SuggestYoutubeVideosOutputSchema},
  prompt: `Given the following task list, suggest 3 relevant YouTube videos that could help the user focus, learn, or be more productive.

Task List: {{{taskList}}}

Please provide the video suggestions as a JSON array of YouTube video URLs.`,
});

const suggestYoutubeVideosFlow = ai.defineFlow(
  {
    name: 'suggestYoutubeVideosFlow',
    inputSchema: SuggestYoutubeVideosInputSchema,
    outputSchema: SuggestYoutubeVideosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
