"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosArrowForward, IoIosHome } from "react-icons/io";

export default function Breadcrumbs({
  customHomeLabel = "Home",
  containerStyle = {},
  showHomeIcon = true,
}) {
  const pathname = usePathname();

  // Don't render breadcrumbs on the root page
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  // Helper to format route slugs into readable text (e.g., "sign-in" -> "Sign In")
  const formatSegment = (segment) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        margin: "0 20px 16px 20px", // Added left and right margin spacing
        fontSize: "0.875rem",
        background: "transparent", // Ensures zero background color
        ...containerStyle,
      }}
    >
      <ol
        style={{
          listStyle: "none",
          display: "flex",
          gap: "8px",
          padding: 0,
          margin: 0,
          alignItems: "center",
          background: "transparent",
        }}
      >
        {/* Home Item */}
        <li style={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              color: "#64748b",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "500",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            {showHomeIcon && <IoIosHome style={{ fontSize: "1rem" }} />}
            {customHomeLabel}
          </Link>
        </li>

        {/* Dynamic Route Segments */}
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          const label = formatSegment(segment);

          return (
            <React.Fragment key={href}>
              {/* Chevron Separator */}
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#cbd5e1",
                }}
              >
                <IoIosArrowForward style={{ fontSize: "0.9rem" }} />
              </li>
              <li>
                {isLast ? (
                  <span
                    style={{
                      color: "#0f172a",
                      fontWeight: "600",
                    }}
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    style={{
                      color: "#64748b",
                      textDecoration: "none",
                      fontWeight: "500",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#4f46e5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#64748b")
                    }
                  >
                    {label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}