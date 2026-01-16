import type { Meta, StoryObj } from "@storybook/react";
import { ConnectButton } from "../../../components/ConnectButton";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";

const meta: Meta<typeof ConnectButton> = {
  title: "Integrations/X/ConnectButton",
  component: ConnectButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConnectButton>;

export const Default: Story = {
  args: {
    platform: "x",
    preset: tailwindPreset,
    icons: defaultIconSet,
    onClick: () => console.log("Connect X clicked"),
  },
};

