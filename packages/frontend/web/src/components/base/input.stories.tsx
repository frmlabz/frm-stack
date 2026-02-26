import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

export default {
  title: "Components/Base/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile input component with support for various input types and states.",
      },
    },
  },
} satisfies Meta<typeof Input>;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Text</label>
        <Input type="text" placeholder="Enter text" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" placeholder="Enter email" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Password</label>
        <Input type="password" placeholder="Enter password" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Number</label>
        <Input type="number" placeholder="Enter number" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Search</label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different input types.",
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    value: "Pre-filled value",
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Input with a pre-filled value.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Invalid input",
    "aria-invalid": true,
    defaultValue: "invalid@",
  },
  parameters: {
    docs: {
      description: {
        story: "Input in an invalid state.",
      },
    },
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <label htmlFor="input-with-label" className="text-sm font-medium">
        Label
      </label>
      <Input id="input-with-label" placeholder="Enter value" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Input with an associated label.",
      },
    },
  },
};
