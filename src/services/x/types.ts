export interface XUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  description?: string;
  location?: string;
  url?: string;
  verified?: boolean;
  verified_type?: string;
  protected?: boolean;
  created_at?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
    like_count?: number;
  };
}

export interface XTweet {
  id: string;
  text: string;
  author_id: string;
  created_at?: string;
  conversation_id?: string;
  in_reply_to_user_id?: string;
  lang?: string;
  possibly_sensitive?: boolean;
  reply_settings?: 'everyone' | 'mentionedUsers' | 'following';
  source?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    bookmark_count?: number;
    impression_count?: number;
  };
  entities?: {
    urls?: Array<{
      start: number;
      end: number;
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
    mentions?: Array<{
      start: number;
      end: number;
      username: string;
      id: string;
    }>;
    hashtags?: Array<{
      start: number;
      end: number;
      tag: string;
    }>;
  };
  attachments?: {
    media_keys?: string[];
    poll_ids?: string[];
  };
}

export interface XMedia {
  media_key: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
  alt_text?: string;
  duration_ms?: number;
  variants?: Array<{
    bit_rate?: number;
    content_type: string;
    url: string;
  }>;
}
