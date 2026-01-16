import type { Meta, StoryObj } from "@storybook/react";
import { AccountCard } from "../../../components/AccountCard";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";
import type { XAccount, User } from "../../../types";

const meta: Meta<typeof AccountCard> = {
  title: "Integrations/X/AccountCard",
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

const mockXAccount: XAccount = {
  id: "2",
  userId: "user1",
  providerId: "x",
  accountId: "x123456",
  username: "testuser_x",
  accessToken: "token456",
  accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
};

export const Connected: Story = {
  args: {
    account: mockXAccount,
    platform: "x",
    preset: tailwindPreset,
    icons: defaultIconSet,
    sessionUser: mockSessionUser,
    onDisconnect: (id) => console.log("Disconnect:", id),
    onReconnect: () => console.log("Reconnect"),
  },
};

