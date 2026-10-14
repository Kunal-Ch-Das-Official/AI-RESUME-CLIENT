import "./brand-marquee.css";
import MicroSoftLogo from "../../../public/microsoft-svgrepo-com.svg";
import GoogleLogo from "../../../public/google-color-svgrepo-com.svg";
import { FaAmazon } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import { FaApple } from "react-icons/fa6";
import { RiNetflixFill } from "react-icons/ri";
import { FaCcStripe } from "react-icons/fa";
import { FaUber } from "react-icons/fa";
import { TbBrandAirbnb } from "react-icons/tb";
import { FaShopify } from "react-icons/fa";

const COMPANIES = [
  { name: "Google", Icon: GoogleLogo, color: "#4285F4" },
  { name: "Microsoft", Icon: MicroSoftLogo, color: "#737373" },
  { name: "Amazon", Icon: FaAmazon, color: "#FF9900" },
  { name: "Meta", Icon: FaMeta, color: "#0866FF" },
  { name: "Apple", Icon: FaApple, color: "#111111" },
  { name: "Netflix", Icon: RiNetflixFill, color: "#E50914" },
  { name: "Stripe", Icon: FaCcStripe, color: "#635BFF" },
  { name: "Uber", Icon: FaUber, color: "#000000" },
  { name: "Airbnb", Icon: TbBrandAirbnb, color: "#FF5A5F" },
  { name: "Shopify", Icon: FaShopify, color: "#7AB55C" },
];

function BrandItems({ duplicate = false }) {
  return COMPANIES.map(({ name, Icon, color }) => {
    // Check if Icon is a Next.js image import (object) or string path
    const isImage =
      typeof Icon === "string" || (typeof Icon === "object" && Icon !== null);
    const imageSrc =
      typeof Icon === "object" && Icon !== null ? Icon.src : Icon;

    return (
      <div
        key={`${duplicate ? "duplicate-" : ""}${name}`}
        className="flex shrink-0 items-center gap-3"
        aria-label={name}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center">
          {isImage ? (
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 object-contain"
            />
          ) : (
            <Icon
              aria-hidden="true"
              focusable="false"
              className="h-7 w-7"
              style={{ color }}
            />
          )}
        </span>
        <span className="whitespace-nowrap text-base font-semibold tracking-tight text-slate-600 transition-colors hover:text-slate-900 sm:text-lg">
          {name}
        </span>
      </div>
    );
  });
}

export default function BrandMarquee() {
  return (
    <section className="border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Candidates built resumes here and got hired at top teams
        </p>

        <div
          className="relative mt-6 w-full overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, white 10%, white 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, white 10%, white 90%, transparent)",
          }}
        >
          <div className="brand-marquee-track flex w-max items-center gap-12 sm:gap-20">
            <div className="flex shrink-0 items-center gap-12 sm:gap-20">
              <BrandItems />
            </div>
            <div
              className="flex shrink-0 items-center gap-12 sm:gap-20"
              aria-hidden="true"
            >
              <BrandItems duplicate />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
