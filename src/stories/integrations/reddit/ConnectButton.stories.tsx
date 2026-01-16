import type { Meta, StoryObj } from "@storybook/react";
import { ConnectButton } from "../../../components/ConnectButton";
import { tailwindPreset } from "../../../presets/tailwind";
import { defaultIconSet } from "../../../icons";

const meta: Meta<typeof ConnectButton> = {
  title: "Integrations/Reddit/ConnectButton",
  component: ConnectButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConnectButton>;

export const Default: Story = {
  args: {
    platform: "reddit",
    preset: tailwindPreset,
    icons: defaultIconSet,
    onClick: () => console.log("Connect Reddit clicked"),
  },
};

