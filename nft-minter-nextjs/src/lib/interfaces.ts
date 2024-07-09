interface IArtistCollection {
  chainId: number;
  contractAddress: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  nextPage?: number;
  previousPage?: number;
}

interface PaginatedResponse {
  message: string;
  artistNFTData: {
    _id: string;
    artist: any; // Consider creating a proper type for this
    nftImagesLinks: Array<{
      decentralizedURL: string;
      centralizedURL: string;
      jsonFileDecentralizedURL?: string;
      basePrice: number;
      tokenId: number;
    }>;
    collectionIPFSLink?: string;
  };
  pagination: PaginationInfo;
}

interface AttributeProps {
  bg: number;
  hair: number;
  eyes: number;
  nose: number;
  mouth: number;
  beard: number;
  head: number;
}

interface LayerFilesProps {
  bgLayers: File[];
  headLayers: File[];
  hairLayers: File[];
  eyesLayers: File[];
  noseLayers: File[];
  mouthLayers: File[];
  beardLayers: File[];
}

interface FileTypeProps {
  type: "bg" | "head" | "hair" | "eyes" | "nose" | "mouth" | "beard";
}

interface Artist {
  _id: string;
  artistName: string;
  artistWalletAddress: string;
  nftCollection: IArtistCollection;
  pfp: {
    decentralizedURL: string;
    url: string;
  };
}

interface NFTImagesLinks {
  decentralizedURL: string;
  centralizedURL: string;
  basePrice: number;
  tokenId: number;
  name: string;
  description: string;
  _id: string;
}

interface ArtistNFTData {
  artistNFTData: {
    _id: string;
    artist: Artist;
  };
  nftImagesLinks: NFTImagesLinks[];
  collectionIPFSLink: string;
}

export type {
  IArtistCollection,
  PaginatedResponse,
  PaginationInfo,
  AttributeProps,
  LayerFilesProps,
  FileTypeProps,
  Artist,
  ArtistNFTData,
  NFTImagesLinks,
};
