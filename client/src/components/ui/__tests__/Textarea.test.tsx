import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Textarea } from "../Textarea";

describe("Textarea", () => {
  describe("rendering", () => {
    it("renders a textarea element", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with value", () => {
      render(<Textarea value="test value" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("test value");
    });
  });

  describe("variants", () => {
    it("applies default variant by default", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("bg-ui-input");
    });

    it("applies subtle variant", () => {
      render(<Textarea variant="subtle" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("bg-ui-inputSubtle");
    });
  });

  describe("error state", () => {
    it("applies error border when error is true", () => {
      render(<Textarea error />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-error");
    });

    it("applies normal border when error is false", () => {
      render(<Textarea error={false} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-ui-glassBorder");
    });

    it("applies normal border by default", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-ui-glassBorder");
    });
  });

  describe("disabled state", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("disabled:opacity-50");
      expect(textarea).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("resize behavior", () => {
    it("has resize-none class by default", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("resize-none");
    });
  });

  describe("interactions", () => {
    it("calls onChange handler when typing", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).toHaveBeenCalled();
    });

    it("updates value when typing", async () => {
      const user = userEvent.setup();
      const React = await import("react");
      const { useState } = React;

      const ControlledTextarea = () => {
        const [value, setValue] = useState("");
        return <Textarea value={value} onChange={(e) => setValue(e.target.value)} />;
      };

      render(<ControlledTextarea />);
      await user.type(screen.getByRole("textbox"), "hello");
      expect(screen.getByRole("textbox")).toHaveValue("hello");
    });
  });

  describe("custom className", () => {
    it("merges custom className with default classes", () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom-class");
      expect(textarea).toHaveClass("w-full"); // default class
    });
  });

  describe("HTML attributes", () => {
    it("passes through HTML attributes", () => {
      render(<Textarea rows={5} name="message" data-testid="message-textarea" />);
      const textarea = screen.getByTestId("message-textarea");
      expect(textarea).toHaveAttribute("rows", "5");
      expect(textarea).toHaveAttribute("name", "message");
    });

    it("supports required attribute", () => {
      render(<Textarea required />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeRequired();
    });

    it("supports maxLength attribute", () => {
      render(<Textarea maxLength={100} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("maxLength", "100");
    });
  });
});
