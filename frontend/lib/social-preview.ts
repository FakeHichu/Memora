export type PreviewStory = {
  id: string;
  name: string;
  photoUri: string;
  tint: string;
};

export type PreviewPost = {
  id: string;
  name: string;
  className: string;
  age: string;
  avatarUri: string;
  photoUri: string;
  caption: string;
  location: string;
  likes: number;
  comments: number;
};

const image = (photoId: string, width: number) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=82`;

export const previewStories: PreviewStory[] = [
  {
    id: 'story-01',
    name: 'Aarav',
    photoUri: image('photo-1506794778202-cad84cf45f1d', 160),
    tint: '#1D2D32',
  },
  {
    id: 'story-02',
    name: 'Mira',
    photoUri: image('photo-1534528741775-53994a69daeb', 160),
    tint: '#352439',
  },
  {
    id: 'story-03',
    name: 'Leena',
    photoUri: image('photo-1531123897727-8f129e1688ce', 160),
    tint: '#332C23',
  },
  {
    id: 'story-04',
    name: 'Kavin',
    photoUri: image('photo-1500648767791-00dcc994a43e', 160),
    tint: '#222C3B',
  },
];

export const previewPosts: PreviewPost[] = [
  {
    id: 'preview-01',
    name: 'Mira Chen',
    className: 'Moments from campus',
    age: '2h',
    avatarUri: image('photo-1534528741775-53994a69daeb', 160),
    photoUri: image('photo-1529156069898-49953e39b3ac', 1100),
    caption: 'The kind of afternoon you wish you could keep a little longer.',
    location: 'Campus lawn',
    likes: 42,
    comments: 8,
  },
  {
    id: 'preview-02',
    name: 'Aarav Nair',
    className: 'A small weekend escape',
    age: '5h',
    avatarUri: image('photo-1506794778202-cad84cf45f1d', 160),
    photoUri: image('photo-1470770841072-f978cf4d019e', 1100),
    caption: 'Somewhere between the last class and the way home.',
    location: 'Western Ghats',
    likes: 28,
    comments: 4,
  },
];

export const previewTopics = [
  { id: 'topic-01', title: 'First week', count: '18 moments', tint: '#28223B' },
  { id: 'topic-02', title: 'Campus after rain', count: '12 moments', tint: '#1C3037' },
  { id: 'topic-03', title: 'Small wins', count: '9 moments', tint: '#302635' },
];
