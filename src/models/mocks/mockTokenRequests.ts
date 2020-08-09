import TokenRequest from "@/models/interfaces/TokenRequest";

const mockTokenRequests: TokenRequest[] = [
  {
    groupId: 1,
    requestCount: 0,
    tokenId: "1",
    timeLogs: []
  },
  {
    groupId: 1,
    requestCount: 1,
    tokenId: "1",
    timeLogs: [Date.now()]
  },
  {
    groupId: 2,
    requestCount: 0,
    tokenId: "1",
    timeLogs: []
  },
  {
    groupId: 2,
    requestCount: 0,
    tokenId: "1",
    timeLogs: []
  }
];

export default mockTokenRequests;
