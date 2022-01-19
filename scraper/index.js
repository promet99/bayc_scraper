var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as stream from "stream";
import { promisify } from "util";
import { createWriteStream, writeFile, existsSync } from "fs";
import axios from "axios";
const NUMBER_OF_NFT = 10000;
const IPFS_PORTAL_URL = "https://ipfs.io/ipfs/";
const TOKEN_URL_BASE = IPFS_PORTAL_URL + "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
const convertIpfsToWebUrl = (ipfsUrl) => IPFS_PORTAL_URL + ipfsUrl.slice(7);
const finished = promisify(stream.finished);
const saveImgFromUrl = (fileUrl, outputLocationPath) => __awaiter(void 0, void 0, void 0, function* () {
    const writer = createWriteStream(outputLocationPath);
    return axios({
        method: "get",
        url: fileUrl,
        responseType: "stream",
    }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
        response.data.pipe(writer);
        return finished(writer); //this is a Promise
    }));
});
const saveImages = (start) => __awaiter(void 0, void 0, void 0, function* () {
    const getStart = () => {
        if (!start || isNaN(start)) {
            return 0;
        }
        else {
            return start;
        }
    };
    for (let count = getStart(); count < NUMBER_OF_NFT; count++) {
        const imagePath = `./image/${count}.jpg`;
        const textPath = `./image/${count}.txt`;
        const fileNotDownloadedYet = !existsSync(imagePath) || !existsSync(textPath);
        console.log(count + (fileNotDownloadedYet ? ": DOWNLOAD" : ": SKIP"));
        if (fileNotDownloadedYet) {
            const url = TOKEN_URL_BASE + count;
            yield axios.get(url).then((e) => __awaiter(void 0, void 0, void 0, function* () {
                const { data } = e;
                const imgUrl = convertIpfsToWebUrl(data.image);
                saveImgFromUrl(imgUrl, imagePath);
                new Promise((res, rej) => {
                    writeFile(textPath, JSON.stringify(data), res);
                });
            }));
        }
    }
});
const startingNumber = parseInt(process.argv[2]);
saveImages(startingNumber);
