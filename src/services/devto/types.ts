export interface DevToUser {
  id: number;
  username: string;
  name: string;
  twitter_username?: string;
  github_username?: string;
  summary?: string;
  location?: string;
  website_url?: string;
  joined_at: string;
  profile_image: string;
  profile_image_90?: string;
}

export interface DevToArticle {
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  collection_id?: number;
  published_timestamp: string;
  positive_reactions_count: number;
  cover_image?: string;
  social_image?: string;
  canonical_url?: string;
  created_at: string;
  edited_at?: string;
  crossposted_at?: string;
  published_at?: string;
  last_comment_at?: string;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  body_html?: string;
  body_markdown?: string;
  user: {
    name: string;
    username: string;
    twitter_username?: string;
    github_username?: string;
    website_url?: string;
    profile_image: string;
    profile_image_90?: string;
  };
  organization?: {
    name: string;
    username: string;
    slug: string;
    profile_image: string;
    profile_image_90?: string;
  };
  flare_tag?: {
    name: string;
    bg_color_hex: string;
    text_color_hex: string;
  };
}

export interface DevToCreateArticle {
  title: string;
  body_markdown: string;
  published?: boolean;
  series?: string;
  main_image?: string;
  canonical_url?: string;
  description?: string;
  tags?: string[];
  organization_id?: number;
}

export interface DevToComment {
  id_code: string;
  created_at: string;
  body_html: string;
  user: {
    name: string;
    username: string;
    twitter_username?: string;
    github_username?: string;
    website_url?: string;
    profile_image: string;
    profile_image_90?: string;
  };
  children?: DevToComment[];
}
