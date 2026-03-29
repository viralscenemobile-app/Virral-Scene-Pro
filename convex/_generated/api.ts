export const api = {
  users: {
    get: "users:get",
    getById: "users:getById",
    getOrCreate: "users:getOrCreate",
    update: "users:update",
    deductCoins: "users:deductCoins",
  },
  creations: {
    list: "creations:list",
    listByUser: "creations:listByUser",
    create: "creations:create",
    search: "creations:search",
  },
  interactions: {
    toggleLike: "interactions:toggleLike",
    toggleBookmark: "interactions:toggleBookmark",
    toggleFollow: "interactions:toggleFollow",
    addComment: "interactions:addComment",
    getComments: "interactions:getComments",
    checkInteractions: "interactions:checkInteractions",
  },
  challenges: {
    list: "challenges:list",
  },
  leaderboard: {
    list: "leaderboard:list",
  },
} as any;
