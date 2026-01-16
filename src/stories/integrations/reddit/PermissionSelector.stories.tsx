import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PermissionSelector } from "../../../components/PermissionSelector";
import { tailwindPreset } from "../../../presets/tailwind";
import { REDDIT_PERMISSIONS } from "../../../types";

const meta: Meta<typeof PermissionSelector> = {
  title: "Integrations/Reddit/PermissionSelector",
  component: PermissionSelector,
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
type Story = StoryObj<typeof PermissionSelector>;

const Wrapper = (args: React.ComponentProps<typeof PermissionSelector>) => {
  const [selected, setSelected] = useState(args.selected);
  return <PermissionSelector {...args} selected={selected} onChange={setSelected} />;
};

export const Default: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    platform: "reddit",
    preset: tailwindPreset,
    permissions: REDDIT_PERMISSIONS,
    selected: REDDIT_PERMISSIONS.filter((p) => p.default || p.required).map((p) => p.id),
    required: REDDIT_PERMISSIONS.filter((p) => p.required).map((p) => p.id),
  },
};

