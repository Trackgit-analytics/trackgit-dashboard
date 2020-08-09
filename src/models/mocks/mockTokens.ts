import Token from "@/models/interfaces/Token";
import mockTokenRequests from "@/models/mocks/mockTokenRequests";

const mockTokens: Token[] = [
  {
    id: "1",
    name: "Test 1",
    owner: "shanzid",
    shortUrl: "https://bit.ly/shortToken",
    url: "https://trackgitApi/token/ping/1",
    tokenRequests: mockTokenRequests
  },
  {
    id: "2",
    name: "Test 2",
    owner: "shanzid",
    shortUrl: "https://bit.ly/shortToken",
    url: "https://trackgitApi/token/ping/1",
    tokenRequests: []
  },
  {
    id: "3",
    name: "Test 3",
    owner: "shanzid",
    shortUrl: "https://bit.ly/shortToken",
    url: "https://trackgitApi/token/ping/1",
    tokenRequests: []
  },
  {
    id: "4",
    name: "Test 4",
    owner: "shanzid",
    shortUrl: "https://bit.ly/shortToken",
    url: "https://trackgitApi/token/ping/1",
    tokenRequests: []
  }
];

export default mockTokens;
