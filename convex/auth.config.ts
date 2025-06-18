export default {
  providers: [
    {
      domain: process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL,
      applicationID: "convex",
    },
  ],
};
