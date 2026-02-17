import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Toaster } from "./sonner";
import { toast } from "sonner";

// Stub next-themes in case sonner internals reference it
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

// Helper: render toaster and trigger a toast so the toaster element mounts
async function renderWithToast(message = "test") {
  render(<Toaster />);
  act(() => {
    toast(message);
  });
  await screen.findByText(message);
}

describe("Toaster", () => {
  beforeEach(() => {
    toast.dismiss();
  });

  it("renders the toaster container after a toast", async () => {
    await renderWithToast();
    expect(document.querySelector("[data-sonner-toaster]")).toBeInTheDocument();
  });

  it("is positioned bottom-right", async () => {
    await renderWithToast();
    const toaster = document.querySelector("[data-sonner-toaster]");
    expect(toaster).toHaveAttribute("data-x-position", "right");
    expect(toaster).toHaveAttribute("data-y-position", "bottom");
  });

  it("does not use dark theme", async () => {
    await renderWithToast();
    const toaster = document.querySelector("[data-sonner-toaster]");
    expect(toaster).toBeInTheDocument();
    // Sonner may omit data-theme for "light" (default); verify it's not "dark"
    const theme = toaster?.getAttribute("data-theme");
    expect(theme).not.toBe("dark");
  });

  it("displays a success toast with correct styling", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Link generated!");
    });
    await screen.findByText("Link generated!");
    const toastContainer = document.querySelector("[data-type='success']");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer?.className).toContain("!bg-[#F4FFF0]");
    expect(toastContainer?.className).toContain("!text-[#004D23]");
  });

  it("displays an error toast with correct styling", async () => {
    render(<Toaster />);
    act(() => {
      toast.error("Something went wrong");
    });
    await screen.findByText("Something went wrong");
    const toastContainer = document.querySelector("[data-type='error']");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer?.className).toContain("!bg-red-50");
    expect(toastContainer?.className).toContain("!text-red-900");
  });

  it("displays a warning toast with correct styling", async () => {
    render(<Toaster />);
    act(() => {
      toast.warning("Approaching limit");
    });
    await screen.findByText("Approaching limit");
    const toastContainer = document.querySelector("[data-type='warning']");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer?.className).toContain("!bg-[#F4FFCC]");
  });

  it("displays an info toast with correct styling", async () => {
    render(<Toaster />);
    act(() => {
      toast.info("Helpful info");
    });
    await screen.findByText("Helpful info");
    const toastContainer = document.querySelector("[data-type='info']");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer?.className).toContain("!bg-[#EFF0F6]");
  });

  it("renders a close button on toasts", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Closeable toast");
    });
    await screen.findByText("Closeable toast");
    expect(document.querySelector("[data-close-button]")).toBeInTheDocument();
  });

  it("shows multiple toasts", async () => {
    render(<Toaster />);
    act(() => {
      toast("Toast 1");
      toast("Toast 2");
      toast("Toast 3");
    });
    await screen.findByText("Toast 1");
    await screen.findByText("Toast 2");
    await screen.findByText("Toast 3");
    const visibleToasts = document.querySelectorAll("[data-sonner-toast]");
    expect(visibleToasts.length).toBeGreaterThanOrEqual(3);
  });
});
