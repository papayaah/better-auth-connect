import type { Meta, StoryObj } from "@storybook/react";
import { FeatureList } from "../../../components/FeatureList";
import { defaultIconSet } from "../../../icons";
import { tailwindPreset } from "../../../presets/tailwind";

const meta: Meta<typeof FeatureList> = {
  title: "Integrations/Reddit/FeatureList",
  component: FeatureList,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "720px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FeatureList>;

export const Default: Story = {
  args: {
    platform: "reddit",
    preset: tailwindPreset,
    icons: defaultIconSet,
  },
};

