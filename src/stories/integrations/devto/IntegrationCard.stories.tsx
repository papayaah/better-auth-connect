import type { Meta, StoryObj } from "@storybook/react";
import { IntegrationCard } from "../../../components/IntegrationCard";
import { IntegrationProvider } from "../../../components/IntegrationProvider";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";
import { mockAuthClient } from "../_shared/mockAuthClient";

const meta: Meta<typeof IntegrationCard> = {
  title: "Integrations/Dev.to/IntegrationCard",
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
    platform: "devto",
    preset: tailwindPreset,
    icons: defaultIconSet,
    showPermissions: false, // Dev.to is API key based
    showFeatures: true,
  },
};

