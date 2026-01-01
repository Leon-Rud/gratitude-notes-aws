import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Typography } from "../Typography";

describe("Typography", () => {
  describe("variants and default tags", () => {
    it("renders h1 variant as h1 element", () => {
      render(<Typography variant="h1">Heading 1</Typography>);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Heading 1");
    });

    it("renders h2 variant as h2 element", () => {
      render(<Typography variant="h2">Heading 2</Typography>);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Heading 2");
    });

    it("renders body variant as p element", () => {
      render(<Typography variant="body">Body text</Typography>);
      const paragraph = screen.getByText("Body text");
      expect(paragraph.tagName).toBe("P");
    });

    it("renders n1 variant as p element", () => {
      render(<Typography variant="n1">Note text</Typography>);
      const paragraph = screen.getByText("Note text");
      expect(paragraph.tagName).toBe("P");
    });

    it("renders label variant as label element", () => {
      render(<Typography variant="label">Label text</Typography>);
      const label = screen.getByText("Label text");
      expect(label.tagName).toBe("LABEL");
    });

    it("renders caption variant as p element", () => {
      render(<Typography variant="caption">Caption text</Typography>);
      const caption = screen.getByText("Caption text");
      expect(caption.tagName).toBe("P");
    });
  });

  describe("custom 'as' prop", () => {
    it("overrides default tag with custom element", () => {
      render(<Typography variant="h1" as="span">Span Heading</Typography>);
      const element = screen.getByText("Span Heading");
      expect(element.tagName).toBe("SPAN");
    });

    it("renders h2 variant as h3 when as='h3'", () => {
      render(<Typography variant="h2" as="h3">Heading 3</Typography>);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it("renders body variant as span", () => {
      render(<Typography variant="body" as="span">Span text</Typography>);
      const element = screen.getByText("Span text");
      expect(element.tagName).toBe("SPAN");
    });
  });

  describe("variant styles", () => {
    it("applies h1 styles", () => {
      render(<Typography variant="h1">H1</Typography>);
      const element = screen.getByText("H1");
      expect(element).toHaveClass("text-h1");
      expect(element).toHaveClass("font-poppins");
      expect(element).toHaveClass("font-bold");
    });

    it("applies h2 styles", () => {
      render(<Typography variant="h2">H2</Typography>);
      const element = screen.getByText("H2");
      expect(element).toHaveClass("text-h2");
      expect(element).toHaveClass("font-poppins");
      expect(element).toHaveClass("font-semibold");
    });

    it("applies body styles", () => {
      render(<Typography variant="body">Body</Typography>);
      const element = screen.getByText("Body");
      expect(element).toHaveClass("text-body");
      expect(element).toHaveClass("font-manrope");
      expect(element).toHaveClass("font-semibold");
    });

    it("applies n1 styles", () => {
      render(<Typography variant="n1">N1</Typography>);
      const element = screen.getByText("N1");
      expect(element).toHaveClass("text-n1");
      expect(element).toHaveClass("font-manrope");
      expect(element).toHaveClass("font-medium");
    });

    it("applies label styles", () => {
      render(<Typography variant="label">Label</Typography>);
      const element = screen.getByText("Label");
      expect(element).toHaveClass("text-sm");
      expect(element).toHaveClass("font-poppins");
      expect(element).toHaveClass("font-medium");
    });

    it("applies caption styles", () => {
      render(<Typography variant="caption">Caption</Typography>);
      const element = screen.getByText("Caption");
      expect(element).toHaveClass("font-poppins");
      expect(element).toHaveClass("text-sm");
      expect(element).toHaveClass("font-normal");
    });
  });

  describe("nowrap prop", () => {
    it("applies whitespace-nowrap when nowrap is true", () => {
      render(<Typography variant="body" nowrap>No wrap</Typography>);
      const element = screen.getByText("No wrap");
      expect(element).toHaveClass("whitespace-nowrap");
    });

    it("does not apply whitespace-nowrap by default", () => {
      render(<Typography variant="body">Normal wrap</Typography>);
      const element = screen.getByText("Normal wrap");
      expect(element).not.toHaveClass("whitespace-nowrap");
    });
  });

  describe("custom className", () => {
    it("merges custom className with variant classes", () => {
      render(<Typography variant="h1" className="text-red-500">Custom</Typography>);
      const element = screen.getByText("Custom");
      expect(element).toHaveClass("text-red-500");
      expect(element).toHaveClass("font-poppins"); // variant class
    });
  });

  describe("HTML attributes", () => {
    it("passes through HTML attributes", () => {
      render(<Typography variant="body" id="my-text" data-testid="text">Text</Typography>);
      const element = screen.getByTestId("text");
      expect(element).toHaveAttribute("id", "my-text");
    });

    it("supports aria attributes", () => {
      render(<Typography variant="h1" aria-label="Main heading">Heading</Typography>);
      const element = screen.getByRole("heading");
      expect(element).toHaveAttribute("aria-label", "Main heading");
    });
  });

  describe("children", () => {
    it("renders text children", () => {
      render(<Typography variant="body">Simple text</Typography>);
      expect(screen.getByText("Simple text")).toBeInTheDocument();
    });

    it("renders nested elements", () => {
      render(
        <Typography variant="body">
          Text with <strong>bold</strong> and <em>italic</em>
        </Typography>
      );
      expect(screen.getByText("bold")).toBeInTheDocument();
      expect(screen.getByText("italic")).toBeInTheDocument();
    });
  });
});
