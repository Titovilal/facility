/**
 * Interface for defining pricing configurations.
 */
export interface PricingConfig {
  name: string;
  mode: "payment" | "subscription";
  price: number;
  priceId: string;
  subCredits?: number;
  otpCredits?: number;
}

/**
 * Interface for defining the structure of the configuration file.
 */
export interface ConfigFile {
  [key: string]: string | string[] | PricingConfig | PricingConfig[];
  mainPage: string;
  pricing: PricingConfig[];
}

export const BASE_URL = "https://tprograms-template.vercel.app";

export const configFile = {
  title: "Terturions Template",
  description: "A Next.js template with everything you need for your next big idea",
  url: BASE_URL,
  contact: "contact@terturions.com",
  author: "Terturions Software",
  mainPage: "/dashboard",
  authPage: "/auth",
  iconUrl: "/terturions-icon.png",
  og: {
    url: `${BASE_URL}/terturions-og.png`,
    alt: "Terturions - Next.js Template",
    width: 1200,
    height: 630,
  },
  pricing: [
    {
      name: "Basic OTP",
      mode: "payment",
      price: 100,
      priceId: "price_1R3RhwE8j0YIYCpCz2mAA3zi",
      otpCredits: 150,
    },
    {
      name: "Pro Subscription",
      mode: "subscription",
      price: 10,
      priceId: "price_1R3RkHE8j0YIYCpCc7J0FuWX",
      subCredits: 15,
    },
  ],
};
