import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal, ModalHeader } from "../Modal";

describe("Modal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders children when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    );

    // Click the overlay (first fixed element with z-40)
    const overlay = document.querySelector(".z-40");
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when closeOnOverlayClick is false", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}>
        <div>Modal content</div>
      </Modal>
    );

    const overlay = document.querySelector(".z-40");
    fireEvent.click(overlay!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call onClose when modal content is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByText("Modal content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("applies blur overlay by default", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );

    const overlay = document.querySelector(".z-40");
    expect(overlay).toHaveClass("backdrop-blur-[5px]");
    expect(overlay).toHaveClass("bg-black/40");
  });

  it("applies blur-light overlay when specified", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} overlay="blur-light">
        <div>Content</div>
      </Modal>
    );

    const overlay = document.querySelector(".z-40");
    expect(overlay).toHaveClass("backdrop-blur-[5px]");
  });

  it("applies transparent overlay when specified", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} overlay="transparent">
        <div>Content</div>
      </Modal>
    );

    const overlay = document.querySelector(".z-40");
    expect(overlay).toHaveClass("bg-transparent");
  });

  it("applies center position by default", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );

    const container = document.querySelector(".z-50");
    expect(container).toHaveClass("items-center");
    expect(container).toHaveClass("justify-center");
  });

  it("applies bottom-right position when specified", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} position="bottom-right">
        <div>Content</div>
      </Modal>
    );

    const container = document.querySelector(".z-50");
    expect(container).toHaveClass("items-end");
    expect(container).toHaveClass("justify-end");
  });

  it("applies custom className to content", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} className="custom-modal-class">
        <div>Content</div>
      </Modal>
    );

    const content = document.querySelector(".custom-modal-class");
    expect(content).toBeInTheDocument();
  });

  it("renders in a portal to document.body", () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div data-testid="modal-content">Content</div>
      </Modal>
    );

    // Modal should be in document.body, not the render container
    expect(baseElement.querySelector('[data-testid="modal-content"]')).toBeInTheDocument();
  });
});

describe("ModalHeader", () => {
  it("renders title", () => {
    render(<ModalHeader title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders as h2 element", () => {
    render(<ModalHeader title="Test Title" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Test Title");
  });

  it("renders close button when onClose is provided", () => {
    render(<ModalHeader title="Test" onClose={() => {}} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<ModalHeader title="Test" />);
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<ModalHeader title="Test" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    const { container } = render(
      <ModalHeader title="Test" className="custom-header" />
    );
    expect(container.querySelector(".custom-header")).toBeInTheDocument();
  });

  it("has correct default styling", () => {
    const { container } = render(<ModalHeader title="Test" />);
    const header = container.firstChild;
    expect(header).toHaveClass("h-[80px]");
    expect(header).toHaveClass("border-b");
  });
});
