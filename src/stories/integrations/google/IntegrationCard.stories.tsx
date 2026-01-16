import type { Meta, StoryObj } from "@storybook/react";
import { IntegrationCard } from "../../../components/IntegrationCard";
import { IntegrationProvider } from "../../../components/IntegrationProvider";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";
import { mockAuthClient } from "../_shared/mockAuthClient";

const meta: Meta<typeof IntegrationCard> = {
  title: "Integrations/Google/IntegrationCard",
  component: IntegrationCard,
  decorators: [
    (Story) => (
      <IntegrationProvider authClient={mockAuthClient}>
        <div style={{ maxWidth: "420px", padding: "20px" }}>
          <Story />
        </div>
      </IntegrationProvider>
    ),
  ],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IntegrationCard>;

export const Default: Story = {
  args: {
    platform: "google",
    preset: tailwindPreset,
    icons: defaultIconSet,
    showPermissions: false,
    showFeatures: true,
  },
};

export const WithPermissions: Story = {
  args: {
    platform: "google",
    preset: tailwindPreset,
    icons: defaultIconSet,
    showPermissions: true,
    showFeatures: false,
  },
};

export const WithBasicPermissionsOnly: Story = {
  args: {
    platform: "google",
    preset: tailwindPreset,
    icons: defaultIconSet,
    showPermissions: true,
    showFeatures: false,
    permissionIds: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  },
};

