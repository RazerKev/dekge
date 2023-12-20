export const PLANS = [
  {
    name: "Free",
    slug: "free",
    quota: 10,
    pagesPerPdf: 5,
    price: {
      amount: 0,
      priceIds: {
        test: "",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 50,
    pagesPerPdf: 25,
    price: {
      amount: 15,
      priceIds: {
        // The "test" mode is Stripe Test mode with its own API ID & production mode is outside test mode and the real mode which requires its own API ID too.
        test: "price_1ONom0GCYgATC5pHEzASgTKJ",
        production: "",
      },
    },
  },
];
