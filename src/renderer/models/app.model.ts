import { languageStruct } from "../../shared/models";

export interface GlobalContainer {
    lang: languageStruct,
    version: number,
    os: string,
    arch: string
};