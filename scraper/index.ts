import * as stream from "stream";
import { promisify } from "util";
import { createWriteStream, writeFile, existsSync } from "fs";

import axios from "axios";

const NUMBER_OF_NFT = 10000;

const IPFS_PORTAL_URL = "https://ipfs.io/ipfs/";

const TOKEN_URL_BASE =
  IPFS_PORTAL_URL + "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";

const convertIpfsToWebUrl = (ipfsUrl: string): string =>
  IPFS_PORTAL_URL + ipfsUrl.slice(7);

const finished = promisify(stream.finished);

const saveImgFromUrl = async (
  fileUrl: string,
  outputLocationPath: string
): Promise<any> => {
  const writer = createWriteStream(outputLocationPath);
  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then(async (response) => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
};

const saveImages = async (start?: number) => {
  const getStart = (): number => {
    if (!start || isNaN(start)) {
      return 0;
    } else {
      return start;
    }
  };
  for (let count = getStart(); count < NUMBER_OF_NFT; count++) {
    const imagePath = `./image/${count}.jpg`;
    const textPath = `./image/${count}.txt`;
    const fileNotDownloadedYet =
      !existsSync(imagePath) || !existsSync(textPath);
    console.log(count + (fileNotDownloadedYet ? ": DOWNLOAD" : ": SKIP"));
    if (fileNotDownloadedYet) {
      const url = TOKEN_URL_BASE + count;
      await axios.get(url).then(
        async (e: {
          data: {
            image: string;
            attributes: { trait_type: string; value: string }[];
          };
        }) => {
          const { data } = e;
          const imgUrl = convertIpfsToWebUrl(data.image);
          saveImgFromUrl(imgUrl, imagePath);
          new Promise((res, rej) => {
            writeFile(textPath, JSON.stringify(data), res);
          });
        }
      );
    }
  }
};

const startingNumber = parseInt(process.argv[2]);
saveImages(startingNumber);
