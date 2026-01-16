import type { Meta, StoryObj } from "@storybook/react";
import { AccountCard } from "../../../components/AccountCard";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";
import type { RedditAccount, User } from "../../../types";

const meta: Meta<typeof AccountCard> = {
  title: "Integrations/Reddit/AccountCard",
  component: AccountCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "520px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AccountCard>;

const mockSessionUser: User = {
  id: "user1",
  name: "John Doe",
  email: "john@example.com",
  image: "https://i.pravatar.cc/150?img=1",
};

const mockRedditAccount: RedditAccount = {
  id: "1",
  userId: "user1",
  providerId: "reddit",
  accountId: "reddit123abc",
  username: "testuser",
  accessToken: "token123",
  refreshToken: "refresh123",
  accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
};

export const Connected: Story = {
  args: {
    account: mockRedditAccount,
    platform: "reddit",
    preset: tailwindPreset,
    icons: defaultIconSet,
    sessionUser: mockSessionUser,
    onDisconnect: (id) => console.log("Disconnect:", id),
    onReconnect: () => console.log("Reconnect"),
  },
};

