export interface RedditUser {
  id: string;
  name: string;
  icon_img?: string;
  total_karma?: number;
  link_karma?: number;
  comment_karma?: number;
  created_utc?: number;
  has_verified_email?: boolean;
  is_gold?: boolean;
  is_mod?: boolean;
}

export interface RedditSubreddit {
  id: string;
  name: string;
  display_name: string;
  display_name_prefixed: string;
  title: string;
  subscribers: number;
  public_description?: string;
  icon_img?: string;
  community_icon?: string;
  banner_img?: string;
  over18?: boolean;
  url: string;
}

export interface RedditPost {
  id: string;
  name: string;
  title: string;
  selftext?: string;
  selftext_html?: string;
  url?: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  is_self: boolean;
  over_18: boolean;
  spoiler: boolean;
  stickied: boolean;
  locked: boolean;
  archived: boolean;
  thumbnail?: string;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
      resolutions: Array<{ url: string; width: number; height: number }>;
    }>;
  };
}

export interface RedditFlair {
  id: string;
  text: string;
  text_color?: 'dark' | 'light';
  background_color?: string;
  css_class?: string;
  richtext?: Array<{
    e: 'text' | 'emoji';
    t?: string;
    a?: string;
    u?: string;
  }>;
  type?: 'text' | 'richtext';
  allowable_content?: string;
  text_editable?: boolean;
}
