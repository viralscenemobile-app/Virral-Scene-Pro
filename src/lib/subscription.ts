export const isProOrCreator = (tier: string | undefined) => {
  return tier === "pro" || tier === "creator+";
};

export const isCreatorPlus = (tier: string | undefined) => {
  return tier === "creator+";
};
