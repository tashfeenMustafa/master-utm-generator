import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntroSection } from "./intro-section";

describe("IntroSection", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders when not dismissed", () => {
    render(<IntroSection />);
    expect(screen.getByText(/Stop guessing why your/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Destination/i)).toBeInTheDocument();
  });

  it("dismisses when 'Got it' is clicked", () => {
    render(<IntroSection />);
    const button = screen.getByText(/Got it, let's go!/i);
    fireEvent.click(button);
    
    expect(screen.queryByText(/Stop guessing why your/i)).not.toBeInTheDocument();
    expect(localStorage.getItem("utm-generator:onboarding-dismissed")).toBe("true");
  });

  it("dismisses when close icon is clicked", () => {
    render(<IntroSection />);
    const closeButton = screen.getByLabelText(/Dismiss onboarding/i);
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/Stop guessing why your/i)).not.toBeInTheDocument();
    expect(localStorage.getItem("utm-generator:onboarding-dismissed")).toBe("true");
  });

  it("does not render if previously dismissed", () => {
    localStorage.setItem("utm-generator:onboarding-dismissed", "true");
    render(<IntroSection />);
    expect(screen.queryByText(/Stop guessing why your/i)).not.toBeInTheDocument();
  });
});
