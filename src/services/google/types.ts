export interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface GoogleService {
  id: string;
  name: string;
  description: string;
  scopes: string[];
}

export const GOOGLE_SERVICES: GoogleService[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Upload and manage videos, playlists, and channel data',
    scopes: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
    ],
  },
  {
    id: 'blogger',
    name: 'Blogger',
    description: 'Publish and manage blog posts',
    scopes: [
      'https://www.googleapis.com/auth/blogger',
      'https://www.googleapis.com/auth/blogger.readonly',
    ],
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Access and manage files in Google Drive',
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata',
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send emails and manage Gmail',
    scopes: [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
  },
  {
    id: 'photos',
    name: 'Google Photos',
    description: 'Upload and manage photos and albums',
    scopes: [
      'https://www.googleapis.com/auth/photoslibrary',
      'https://www.googleapis.com/auth/photoslibrary.readonly',
      'https://www.googleapis.com/auth/photoslibrary.appendonly',
    ],
  },
];
