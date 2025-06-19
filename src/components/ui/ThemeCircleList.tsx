// // ThemeCircleList.tsx
// import React from "react";
// import { Theme } from "../../themes/types";
// import { ThemeCircle } from "./ThemeCircle";

// interface ThemeCircleListProps {
//   themes: Theme[];
//   size?: "sm" | "md" | "lg";
//   className?: string;
// }

// export const ThemeCircleList: React.FC<ThemeCircleListProps> = ({
//   themes,
//   size = "md",
//   className = "",
// }) => {
//   return (
//     <div
//       className={`flex flex-row flex-wrap justify-center items-center gap-6 ${className}`}
//       style={{ minHeight: "120px" }} // adjust as needed for your sizes
//     >
//       {themes.map((theme, idx) => (
//         <ThemeCircle key={theme.id} theme={theme} size={size} index={idx} />
//       ))}
//     </div>
//   );
// };
