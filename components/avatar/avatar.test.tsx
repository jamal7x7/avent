import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("renders image when src is provided", () => {
    render(<Avatar src="/test.jpg" alt="Test User" size={40} />);
    const img = screen.getByAltText("Test User");
    expect(img).toBeInTheDocument();
    // Next.js Image optimization rewrites src to /_next/image?...&url=%2Ftest.jpg&...
    expect(img.getAttribute("src")).toContain("test.jpg");
  });

  it("renders fallback when src is missing", () => {
    render(<Avatar alt="Fallback User" size={40} />);
    expect(
      screen.getByLabelText(/Fallback User|User avatar/i),
    ).toBeInTheDocument();
  });

  it("renders fallback when image fails to load", () => {
    render(<Avatar src="/broken.jpg" alt="Broken User" size={40} />);
    const img = screen.getByAltText("Broken User");
    fireEvent.error(img);
    expect(
      screen.getByLabelText(/Broken User|User avatar/i),
    ).toBeInTheDocument();
  });

  it("uses i18n alt text", () => {
    render(<Avatar size={40} locale="fr_fr" />);
    expect(screen.getByLabelText("Avatar utilisateur")).toBeInTheDocument();
    render(<Avatar size={40} locale="ar_ma" />);
    expect(
      screen.getByLabelText("الصورة الرمزية للمستخدم"),
    ).toBeInTheDocument();
  });
});
