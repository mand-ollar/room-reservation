export const APP_BRAND_HEADER = "HWAPYUNG";
export const APP_BRAND_TITLE_PRIMARY = "HWAPYUNG";
export const APP_BRAND_TITLE_SECONDARY = "ROOM RESERVATION";
export const APP_BRAND_TITLE = "HWAPYUNG ROOM RESERVATION";

export const paths = {
  home: "/",
  browse: "/browse",
  login: "/login",
  admin: "/admin",
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];
