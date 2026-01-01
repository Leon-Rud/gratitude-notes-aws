import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Input } from "../Input";

describe("Input", () => {
  describe("rendering", () => {
    it("renders an input element", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with value", () => {
      render(<Input value="test value" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("test value");
    });
  });

  describe("variants", () => {
    it("applies default variant by default", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("bg-ui-input");
    });

    it("applies subtle variant", () => {
      render(<Input variant="subtle" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("bg-ui-inputSubtle");
    });
  });

  describe("error state", () => {
    it("applies error border when error is true", () => {
      render(<Input error />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-error");
    });

    it("applies normal border when error is false", () => {
      render(<Input error={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-ui-glassBorder");
    });

    it("applies normal border by default", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-ui-glassBorder");
    });
  });

  describe("disabled state", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("disabled:opacity-50");
      expect(input).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("interactions", () => {
    it("calls onChange handler when typing", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).toHaveBeenCalled();
    });

    it("updates value when typing in controlled mode", async () => {
      const user = userEvent.setup();
      const React = await import("react");
      const { useState } = React;

      const ControlledInput = () => {
        const [value, setValue] = useState("");
        return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
      };

      render(<ControlledInput />);
      await user.type(screen.getByRole("textbox"), "hello");
      expect(screen.getByRole("textbox")).toHaveValue("hello");
    });
  });

  describe("custom className", () => {
    it("merges custom className with default classes", () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
      expect(input).toHaveClass("w-full"); // default class
    });
  });

  describe("HTML attributes", () => {
    it("passes through HTML attributes", () => {
      render(<Input type="email" name="email" data-testid="email-input" />);
      const input = screen.getByTestId("email-input");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("name", "email");
    });

    it("supports required attribute", () => {
      render(<Input required />);
      const input = screen.getByRole("textbox");
      expect(input).toBeRequired();
    });
  });
});
