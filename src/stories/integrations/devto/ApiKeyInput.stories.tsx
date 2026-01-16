import type { Meta, StoryObj } from "@storybook/react";
import { ApiKeyInput } from "../../../components/ApiKeyInput";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";

const meta: Meta<typeof ApiKeyInput> = {
  title: "Integrations/Dev.to/ApiKeyInput",
  component: ApiKeyInput,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "420px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ApiKeyInput>;

export const Default: Story = {
  args: {
    preset: tailwindPreset,
    icons: defaultIconSet,
    onSubmit: async (apiKey) => {
      console.log("Submitted API key:", apiKey);
      await new Promise((resolve) => setTimeout(resolve, 750));
    },
  },
};

