import type { Meta, StoryObj } from "@storybook/react";
import { AccountCard } from "../../../components/AccountCard";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";
import type { DevToAccount } from "../../../types";

const meta: Meta<typeof AccountCard> = {
  title: "Integrations/Dev.to/AccountCard",
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

const mockDevToAccount: DevToAccount = {
  id: "d1",
  userId: "user1",
  providerId: "devto",
  accountId: "devto123",
  username: "devtouser",
  profileImageUrl: "https://i.pravatar.cc/150?img=3",
};

export const Connected: Story = {
  args: {
    account: mockDevToAccount,
    platform: "devto",
    preset: tailwindPreset,
    icons: defaultIconSet,
    onDisconnect: (id) => console.log("Disconnect:", id),
    showExpiration: false,
  },
};

