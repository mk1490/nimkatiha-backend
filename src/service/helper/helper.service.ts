import {Injectable} from '@nestjs/common';
import {v4 as uuidv4} from "uuid";
import {basename, join, resolve} from "path";
import * as bcrypt from "bcryptjs";
import {existsSync, renameSync} from "fs";
import {DirectoryTypes} from "../../enums/directoryTypes";

@Injectable()
export class HelperService {


    getKeyValue(text, value) {
        return {
            text,
            value
        }
    }
    getComboBox(title, value) {
        return {
            title,
            value
        }
    }

    generateUuid() {
        return uuidv4();
    }


    generateRandomNumber(count) {
        let add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

        if (count > max) {
            return this.generateRandomNumber(max) + this.generateRandomNumber(count - max);
        }

        max = Math.pow(10, count + add);
        let min = max / 10; // Math.pow(10, n) basically
        let number = Math.floor(Math.random() * (max - min + 1)) + min;
        return ("" + number).substring(add);
    }


    async generateHashPassword(plainPassword: string): Promise<string> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(plainPassword, saltOrRounds);
        return hash;
    }


    async moveFile(file, targetDirectory) {
        const f = basename(file);
        const dest = resolve(targetDirectory, f);
        await renameSync(file, dest)
    };

    getFileUrl(fileName, directory, directoryType: DirectoryTypes, metaData?: any) {
        if (!checkFileIfExists())
            return null;
        switch (directoryType) {
            case DirectoryTypes.ProjectAttachments:
                return '/'
        }
        function checkFileIfExists(){
            if (!existsSync(directory))
                return false;
        }
    }

    checkFileIfExists(fileName, directory: string, directoryType: DirectoryTypes) {
        if (existsSync(join(directory))) {
            return join(directory, fileName);
        }
        return null;
    }
}
