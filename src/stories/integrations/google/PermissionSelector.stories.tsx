import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PermissionSelector } from "../../../components/PermissionSelector";
import { tailwindPreset } from "../../../presets/tailwind";
import { GOOGLE_PERMISSIONS } from "../../../types";

const meta: Meta<typeof PermissionSelector> = {
  title: "Integrations/Google/PermissionSelector",
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

export const Full: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    platform: "google",
    preset: tailwindPreset,
    permissions: GOOGLE_PERMISSIONS,
    selected: GOOGLE_PERMISSIONS.filter((p) => p.default || p.required).map((p) => p.id),
    required: GOOGLE_PERMISSIONS.filter((p) => p.required).map((p) => p.id),
  },
};

export const BasicOnly: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    platform: "google",
    preset: tailwindPreset,
    permissions: GOOGLE_PERMISSIONS.filter(
      (p) =>
        p.required ||
        [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ].includes(p.id)
    ),
    selected: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    required: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  },
};

