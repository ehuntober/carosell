import type { SlideRole, VAlign } from '../types/slides';

export interface SampleSlide {
  role: SlideRole;
  headline: string;
  body: string;
  emphasis: string[];
  visualDirection: string;
  imagePrompt: string;
  imageUrl: string;
  vAlign: VAlign;
}

export const sampleTopic = '3 quiet habits that make people respect you';

export const sampleCaption =
"Respect isn't loud. These three small habits change how people see you — save this and try one this week.";

export const sampleHashtags = ['#psychology', '#selfimprovement', '#confidence', '#mindset', '#respect'];

export const sampleSlides: SampleSlide[] = [
{
  role: 'hook',
  headline: '3 quiet habits that make people respect you',
  body: 'No loud flexing. No power poses. Just small signals people notice.',
  emphasis: ['respect'],
  visualDirection: 'Lone figure on a night street, seen from behind',
  imagePrompt: 'Lone person in a long coat on a dim city street at night, seen from behind',
  imageUrl: "/61c44486-cd09-410d-a3f1-9b2ffca8724b.jpg",
  vAlign: 'bottom'
},
{
  role: 'content',
  headline: '1. You pause before you answer',
  body: "A two-second pause tells people you're thinking, not reacting. It makes every word carry more weight.",
  emphasis: ['pause'],
  visualDirection: 'Calm face half in shadow, steady gaze',
  imagePrompt: "Close-up of a calm person's face half in shadow, steady confident gaze",
  imageUrl: "/02631021-f6a0-44d8-b3f9-77d96bedc25b.jpg",
  vAlign: 'bottom'
},
{
  role: 'content',
  headline: '2. You keep small promises',
  body: 'Showing up when you said you would builds more trust than any big gesture ever will.',
  emphasis: ['small', 'promises'],
  visualDirection: 'Quiet desk at night with a single lamp',
  imagePrompt: 'Minimal desk at night with a single lamp, closed notebook and a cup of coffee',
  imageUrl: "/2e38072b-a920-422e-b347-ea2b21e28a85.jpg",
  vAlign: 'bottom'
},
{
  role: 'content',
  headline: '3. You listen to understand',
  body: 'Most people listen to reply. One genuine follow-up question makes people feel truly heard.',
  emphasis: ['understand'],
  visualDirection: 'Two people talking in a dim cafe',
  imagePrompt: 'Two people talking across a table in a dim cafe, one listening attentively',
  imageUrl: "/ba3ca380-a54e-4a13-b4a9-5652d6839120.jpg",
  vAlign: 'bottom'
},
{
  role: 'cta',
  headline: 'Respect is built, not demanded',
  body: 'Save this for later and follow for more psychology you can use today.',
  emphasis: ['built'],
  visualDirection: 'Silhouette climbing stairs toward soft light',
  imagePrompt: 'Person walking up a long concrete staircase toward soft dawn light, silhouette',
  imageUrl: "/c4ca95e5-a044-4cbf-b377-066d1da3a091.jpg",
  vAlign: 'bottom'
}];