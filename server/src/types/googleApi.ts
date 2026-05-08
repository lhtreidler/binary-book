export type GoogleBooksVolume = {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: {
    title: string;
    publishedDate: string;
    description: string[];
    industryIdentifiers: [
      {
        type: string;
        identifier: string;
      },
    ];
    authors?: string[];
    readingModes: {
      text: false;
      image: false;
    };
    pageCount: number;
    printType: string;
    categories: string[];
    maturityRating: string;
    allowAnonLogging: false;
    contentVersion: string;
    panelizationSummary: {
      containsEpubBubbles: false;
      containsImageBubbles: false;
    };
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string;
    };
    language: string;
    previewLink: string;
    infoLink: string;
    canonicalVolumeLink: string;
  };
  saleInfo: {
    country: string;
    saleability: string;
    isEbook: false;
  };
  accessInfo: {
    country: string;
    viewability: string;
    embeddable: false;
    publicDomain: false;
    textToSpeechPermission: string;
    epub: {
      isAvailable: false;
    };
    pdf: {
      isAvailable: false;
    };
    webReaderLink: string;
    accessViewStatus: string;
    quoteSharingAllowed: false;
  };
  searchInfo: {
    textSnippet: string;
  };
};

export type GoogleBooksSearchResponse = {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
};

export type FormattedBookItem = {
  key: string;
  title: string;
  authors: string[];
}[];
