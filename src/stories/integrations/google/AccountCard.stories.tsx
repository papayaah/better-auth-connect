import type { Meta, StoryObj } from "@storybook/react";
import { AccountCard } from "../../../components/AccountCard";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";
import type { GoogleAccount, User } from "../../../types";

const meta: Meta<typeof AccountCard> = {
  title: "Integrations/Google/AccountCard",
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

const mockGoogleAccount: GoogleAccount = {
  id: "g1",
  userId: "user1",
  providerId: "google",
  accountId: "google-123",
  email: "john@example.com",
  name: "John Doe",
  picture: "https://i.pravatar.cc/150?img=2",
  accessToken: "token-google",
  refreshToken: "refresh-google",
  accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6),
  scope: "userinfo.profile userinfo.email youtube.readonly",
};

export const Connected: Story = {
  args: {
    account: mockGoogleAccount,
    platform: "google",
    preset: tailwindPreset,
    icons: defaultIconSet,
    sessionUser: mockSessionUser,
    onDisconnect: (id) => console.log("Disconnect:", id),
    onReconnect: () => console.log("Reconnect"),
  },
};

